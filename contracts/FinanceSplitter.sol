// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IPonsV2.sol";

interface IPoolEscrowView {
    function escrow() external view returns (address);
}

/**
 * @title FinanceSplitter
 * @notice Routes future Pons creator fees pro-rata to campaign lenders until a 1.20x repayment cap is reached.
 * Once the cap is fully repaid, creator fee rights are automatically returned to the creator.
 *
 * @dev Lifecycle (brief #16/#20): the splitter is deployed by the FundingPool at pool creation, BEFORE the pool
 * opens, so the creator can transfer the Pons fee recipient to it. Lender shares are fixed once at fill via
 * {activate}. Fees that arrive before activation belong to the creator (no lender money is deployed yet).
 */
contract FinanceSplitter is ReentrancyGuard {
    enum Status {
        ACTIVE,
        REPAID
    }

    /// @notice Financing health (brief #28). A market failure is NOT automatically creator fraud.
    enum Health {
        PENDING,      // not yet activated (pool not filled)
        ACTIVE,       // fees are still being generated
        STALLED,      // no fee activity for stallPeriod
        PARTIAL,      // activity stopped, lenders recovered something
        UNRECOVERED,  // activity stopped, lenders recovered nothing
        REPAID        // full repayment cap reached
    }

    // --- Immutables & Config ---
    address public immutable token;
    address public immutable originalCreator;
    address public immutable ponsFactory;
    address public immutable protocolTreasury;
    address public immutable pool;

    uint256 public immutable principal;
    uint256 public immutable repaymentCap;

    uint256 public constant BPS_DENOMINATOR = 10000;
    uint256 public immutable lenderShareBps;   // e.g. 7500 = 75%
    uint256 public immutable creatorShareBps;  // e.g. 2300 = 23%
    uint256 public immutable protocolShareBps; // e.g. 200  = 2%

    /// @notice No fee activity for this long => STALLED
    uint256 public constant STALL_PERIOD = 3 days;
    /// @notice Stalled for this long in total => PARTIAL / UNRECOVERED
    uint256 public constant UNRECOVERED_PERIOD = 9 days;

    // --- State Variables ---
    Status public status;
    bool public activated;
    uint256 public totalPoolShares;
    uint256 public activatedAt;
    uint256 public lastFeeAt;
    uint256 public totalLenderRepaid;
    uint256 public accRepaymentPerShare; // Scaled by 1e18
    uint256 public creatorAccruedShare;
    uint256 public protocolAccruedShare;

    mapping(address => uint256) public lenderShares;
    mapping(address => uint256) public lenderRewardDebt;

    // --- Events ---
    event Activated(uint256 totalShares, uint256 lenders);
    event FeesReceived(uint256 amount, uint256 lenderAmount, uint256 creatorAmount, uint256 protocolAmount);
    event VendorRefundReceived(uint256 amount);
    event RepaymentClaimed(address indexed lender, uint256 amount);
    event CreatorShareClaimed(address indexed creator, uint256 amount);
    event ProtocolFeeClaimed(address indexed treasury, uint256 amount);
    event RepaymentCapReached(uint256 totalRepaid, address indexed returnedTo);

    modifier onlyPool() {
        require(msg.sender == pool, "Only pool");
        _;
    }

    constructor(
        address _token,
        address _originalCreator,
        address _ponsFactory,
        address _protocolTreasury,
        uint256 _principal,
        uint256 _repaymentCapMultiplierBps, // e.g. 12000 = 1.20x
        uint256 _lenderShareBps,
        uint256 _creatorShareBps
    ) {
        require(_token != address(0), "Invalid token");
        require(_originalCreator != address(0), "Invalid creator");
        require(_ponsFactory != address(0), "Invalid factory");
        require(_protocolTreasury != address(0), "Invalid treasury");
        require(_principal > 0, "Invalid principal");
        require(_lenderShareBps + _creatorShareBps <= BPS_DENOMINATOR, "Invalid shares");

        pool = msg.sender;
        token = _token;
        originalCreator = _originalCreator;
        ponsFactory = _ponsFactory;
        protocolTreasury = _protocolTreasury;
        principal = _principal;
        repaymentCap = (_principal * _repaymentCapMultiplierBps) / BPS_DENOMINATOR;

        lenderShareBps = _lenderShareBps;
        creatorShareBps = _creatorShareBps;
        protocolShareBps = BPS_DENOMINATOR - (_lenderShareBps + _creatorShareBps);

        status = Status.ACTIVE;
    }

    /// @notice Called once by the pool when the funding target is met. Fixes lender shares.
    function activate(address[] calldata _lenders, uint256[] calldata _shares) external onlyPool {
        require(!activated, "Already activated");
        require(_lenders.length == _shares.length && _lenders.length > 0, "Array length mismatch");

        uint256 sumShares = 0;
        for (uint256 i = 0; i < _lenders.length; i++) {
            lenderShares[_lenders[i]] += _shares[i];
            sumShares += _shares[i];
        }
        require(sumShares > 0, "No shares");
        totalPoolShares = sumShares;
        activated = true;
        activatedAt = block.timestamp;
        lastFeeAt = block.timestamp;
        emit Activated(sumShares, _lenders.length);
    }

    /// @notice Allows the contract to receive native ETH from Pons fee claims or direct transfers
    receive() external payable {
        _processIncomingFees(msg.value);
    }

    /// @notice Permissionless function to sweep/claim accrued creator fees from Pons fee escrow
    function claimPonsFees() external nonReentrant returns (uint256 claimed) {
        claimed = IPonsV2(ponsFactory).claim(address(this));
    }

    /// @notice A refunded vendor payment (brief #18) is returned pro-rata to lenders.
    /// @dev Counts toward the repayment cap so lenders can never recover more than cap in total.
    function depositVendorRefund() external payable {
        require(msg.sender == IPoolEscrowView(pool).escrow(), "Only escrow");
        require(activated && status == Status.ACTIVE, "Not accepting refunds");
        uint256 amount = msg.value;
        require(amount > 0, "No refund");
        uint256 remaining = repaymentCap > totalLenderRepaid ? repaymentCap - totalLenderRepaid : 0;
        uint256 toLenders = amount > remaining ? remaining : amount;
        totalLenderRepaid += toLenders;
        accRepaymentPerShare += (toLenders * 1e18) / totalPoolShares;
        if (amount > toLenders) {
            creatorAccruedShare += amount - toLenders;
        }
        emit VendorRefundReceived(amount);
    }

    /// @dev Internal fee distribution and cap enforcement engine
    function _processIncomingFees(uint256 amount) internal {
        if (amount == 0) return;

        // Before fill, or after repayment: no lender money is at stake -> 100% to creator
        if (!activated || status == Status.REPAID) {
            creatorAccruedShare += amount;
            emit FeesReceived(amount, 0, amount, 0);
            return;
        }

        lastFeeAt = block.timestamp;

        uint256 remainingToCap = repaymentCap > totalLenderRepaid ? repaymentCap - totalLenderRepaid : 0;
        uint256 prospectiveLenderShare = (amount * lenderShareBps) / BPS_DENOMINATOR;

        if (prospectiveLenderShare >= remainingToCap) {
            // Cap reached with this payment!
            uint256 actualLenderShare = remainingToCap;
            uint256 protocolAmount = (amount * protocolShareBps) / BPS_DENOMINATOR;
            uint256 creatorAmount = amount - actualLenderShare - protocolAmount;

            totalLenderRepaid += actualLenderShare;
            accRepaymentPerShare += (actualLenderShare * 1e18) / totalPoolShares;

            creatorAccruedShare += creatorAmount;
            protocolAccruedShare += protocolAmount;

            status = Status.REPAID;
            emit RepaymentCapReached(totalLenderRepaid, originalCreator);

            // Automatically return creator fee recipient to the original creator!
            try IPonsV2(ponsFactory).transferCreatorFeeRecipient(token, originalCreator) {
                // Successfully transferred back
            } catch {
                // If call fails, anyone can still trigger returnRecipientToCreator()
            }

            emit FeesReceived(amount, actualLenderShare, creatorAmount, protocolAmount);
        } else {
            // Standard repayment phase
            uint256 lenderAmount = prospectiveLenderShare;
            uint256 creatorAmount = (amount * creatorShareBps) / BPS_DENOMINATOR;
            uint256 protocolAmount = amount - lenderAmount - creatorAmount;

            totalLenderRepaid += lenderAmount;
            accRepaymentPerShare += (lenderAmount * 1e18) / totalPoolShares;

            creatorAccruedShare += creatorAmount;
            protocolAccruedShare += protocolAmount;

            emit FeesReceived(amount, lenderAmount, creatorAmount, protocolAmount);
        }
    }

    /// @notice Current financing health (brief #28).
    function health() external view returns (Health) {
        if (!activated) return Health.PENDING;
        if (status == Status.REPAID) return Health.REPAID;
        uint256 idle = block.timestamp - lastFeeAt;
        if (idle < STALL_PERIOD) return Health.ACTIVE;
        if (idle < UNRECOVERED_PERIOD) return Health.STALLED;
        return totalLenderRepaid > 0 ? Health.PARTIAL : Health.UNRECOVERED;
    }

    /// @notice Returns pending repayment ETH claimable by a lender
    function pendingRepayment(address lender) external view returns (uint256) {
        uint256 shares = lenderShares[lender];
        if (shares == 0) return 0;
        uint256 accumulated = (shares * accRepaymentPerShare) / 1e18;
        if (accumulated > lenderRewardDebt[lender]) {
            return accumulated - lenderRewardDebt[lender];
        }
        return 0;
    }

    /// @notice Lender claims their pro-rata repayment share in ETH
    function claimRepayment() external nonReentrant returns (uint256 payout) {
        uint256 shares = lenderShares[msg.sender];
        require(shares > 0, "No shares");

        uint256 accumulated = (shares * accRepaymentPerShare) / 1e18;
        require(accumulated > lenderRewardDebt[msg.sender], "Nothing to claim");

        payout = accumulated - lenderRewardDebt[msg.sender];
        lenderRewardDebt[msg.sender] = accumulated;

        (bool success, ) = payable(msg.sender).call{value: payout}("");
        require(success, "ETH transfer failed");

        emit RepaymentClaimed(msg.sender, payout);
    }

    /// @notice Creator claims their accrued share of trading fees
    function claimCreatorShare() external nonReentrant returns (uint256 payout) {
        require(msg.sender == originalCreator, "Only creator");
        payout = creatorAccruedShare;
        require(payout > 0, "No creator share available");

        creatorAccruedShare = 0;
        (bool success, ) = payable(originalCreator).call{value: payout}("");
        require(success, "ETH transfer failed");

        emit CreatorShareClaimed(originalCreator, payout);
    }

    /// @notice Protocol claims its accrued platform fee
    function claimProtocolFee() external nonReentrant returns (uint256 payout) {
        payout = protocolAccruedShare;
        require(payout > 0, "No protocol fee available");

        protocolAccruedShare = 0;
        (bool success, ) = payable(protocolTreasury).call{value: payout}("");
        require(success, "ETH transfer failed");

        emit ProtocolFeeClaimed(protocolTreasury, payout);
    }

    /// @notice Permissionless fallback to return fee recipient after full repayment.
    /// @dev Locked to REPAID so fee rights can never be pulled back early (brief #35 invariant).
    function returnRecipientToCreator() external {
        require(status == Status.REPAID, "Not repaid yet");
        IPonsV2(ponsFactory).transferCreatorFeeRecipient(token, originalCreator);
    }

    /// @notice Pool-only: hand fee rights back to the creator when the pool never funded (cancel/expire/refund).
    /// @dev Only allowed while no lender money was ever deployed to a campaign (not activated).
    function releaseUnfunded() external onlyPool {
        require(!activated, "Funded");
        try IPonsV2(ponsFactory).transferCreatorFeeRecipient(token, originalCreator) {} catch {}
    }
}
