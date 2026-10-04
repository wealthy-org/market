// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IPonsV2.sol";

/**
 * @title FinanceSplitter
 * @notice Routes future Pons creator fees pro-rata to campaign lenders until a 1.20x repayment cap is reached.
 * Once the cap is fully repaid, creator fee rights are automatically returned to the creator.
 */
contract FinanceSplitter is ReentrancyGuard {
    enum Status {
        ACTIVE,
        REPAID
    }

    // --- Immutables & Config ---
    address public immutable token;
    address public immutable originalCreator;
    address public immutable ponsFactory;
    address public immutable protocolTreasury;

    uint256 public immutable principal;
    uint256 public immutable repaymentCap;
    uint256 public immutable totalPoolShares;

    uint256 public constant BPS_DENOMINATOR = 10000;
    uint256 public immutable lenderShareBps;   // e.g. 7000 = 70%
    uint256 public immutable creatorShareBps;  // e.g. 2500 = 25%
    uint256 public immutable protocolShareBps; // e.g. 500  = 5%

    // --- State Variables ---
    Status public status;
    uint256 public totalLenderRepaid;
    uint256 public accRepaymentPerShare; // Scaled by 1e18
    uint256 public creatorAccruedShare;
    uint256 public protocolAccruedShare;

    mapping(address => uint256) public lenderShares;
    mapping(address => uint256) public lenderRewardDebt;

    // --- Events ---
    event FeesReceived(uint256 amount, uint256 lenderAmount, uint256 creatorAmount, uint256 protocolAmount);
    event RepaymentClaimed(address indexed lender, uint256 amount);
    event CreatorShareClaimed(address indexed creator, uint256 amount);
    event ProtocolFeeClaimed(address indexed treasury, uint256 amount);
    event RepaymentCapReached(uint256 totalRepaid, address indexed returnedTo);

    constructor(
        address _token,
        address _originalCreator,
        address _ponsFactory,
        address _protocolTreasury,
        uint256 _principal,
        uint256 _repaymentCapMultiplierBps, // e.g. 12000 = 1.20x
        uint256 _lenderShareBps,
        uint256 _creatorShareBps,
        address[] memory _lenders,
        uint256[] memory _shares
    ) {
        require(_token != address(0), "Invalid token");
        require(_originalCreator != address(0), "Invalid creator");
        require(_ponsFactory != address(0), "Invalid factory");
        require(_protocolTreasury != address(0), "Invalid treasury");
        require(_principal > 0, "Invalid principal");
        require(_lenders.length == _shares.length && _lenders.length > 0, "Array length mismatch");
        require(_lenderShareBps + _creatorShareBps <= BPS_DENOMINATOR, "Invalid shares");

        token = _token;
        originalCreator = _originalCreator;
        ponsFactory = _ponsFactory;
        protocolTreasury = _protocolTreasury;
        principal = _principal;
        repaymentCap = (_principal * _repaymentCapMultiplierBps) / BPS_DENOMINATOR;

        lenderShareBps = _lenderShareBps;
        creatorShareBps = _creatorShareBps;
        protocolShareBps = BPS_DENOMINATOR - (_lenderShareBps + _creatorShareBps);

        uint256 sumShares = 0;
        for (uint256 i = 0; i < _lenders.length; i++) {
            lenderShares[_lenders[i]] += _shares[i];
            sumShares += _shares[i];
        }
        totalPoolShares = sumShares;
        status = Status.ACTIVE;
    }

    /// @notice Allows the contract to receive native ETH from Pons fee claims or direct transfers
    receive() external payable {
        _processIncomingFees(msg.value);
    }

    /// @notice Permissionless function to sweep/claim accrued creator fees from Pons fee escrow
    function claimPonsFees() external nonReentrant returns (uint256 claimed) {
        claimed = IPonsV2(ponsFactory).claim(address(this));
    }

    /// @dev Internal fee distribution and cap enforcement engine
    function _processIncomingFees(uint256 amount) internal {
        if (amount == 0) return;

        // If already repaid, 100% of future fees go to the creator
        if (status == Status.REPAID) {
            creatorAccruedShare += amount;
            emit FeesReceived(amount, 0, amount, 0);
            return;
        }

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
                // If call fails, creator can still trigger manual return
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

    /// @notice Creator claims their accrued 25% share of trading fees
    function claimCreatorShare() external nonReentrant returns (uint256 payout) {
        require(msg.sender == originalCreator, "Only creator");
        payout = creatorAccruedShare;
        require(payout > 0, "No creator share available");

        creatorAccruedShare = 0;
        (bool success, ) = payable(originalCreator).call{value: payout}("");
        require(success, "ETH transfer failed");

        emit CreatorShareClaimed(originalCreator, payout);
    }

    /// @notice Protocol claims its accrued 5% platform fee
    function claimProtocolFee() external nonReentrant returns (uint256 payout) {
        payout = protocolAccruedShare;
        require(payout > 0, "No protocol fee available");

        protocolAccruedShare = 0;
        (bool success, ) = payable(protocolTreasury).call{value: payout}("");
        require(success, "ETH transfer failed");

        emit ProtocolFeeClaimed(protocolTreasury, payout);
    }

    /// @notice Emergency fallback to transfer fee recipient back to creator if auto-transfer failed
    function returnRecipientToCreator() external {
        require(status == Status.REPAID || msg.sender == protocolTreasury, "Not eligible");
        IPonsV2(ponsFactory).transferCreatorFeeRecipient(token, originalCreator);
    }
}
