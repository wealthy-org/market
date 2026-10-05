// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./FinanceSplitter.sol";
import "./CampaignEscrow.sol";
import "./interfaces/IPonsV2.sol";

/**
 * @title FundingPool
 * @notice All-or-nothing pooled funding contract for a standardized token launch campaign (e.g. DEX Screener $299).
 *
 * @dev Lifecycle (brief #17):
 *   DRAFT (offchain) -> AWAITING_FEE_TRANSFER -> OPEN -> FILLED -> CAMPAIGN_PENDING -> ACTIVE_REPAYMENT -> REPAID
 *   Failure before capital is deployed: OPEN -> EXPIRED / CANCELLED -> refund. Post-fill failure: REFUNDABLE.
 *
 * The FinanceSplitter is deployed at construction so the creator can transfer the Pons fee recipient to it
 * BEFORE the pool opens. Contributions are only accepted while the recipient is still the splitter (brief #16).
 */
contract FundingPool is ReentrancyGuard {
    enum PoolStatus {
        DRAFT,
        AWAITING_FEE_TRANSFER,
        OPEN,
        FILLED,
        CAMPAIGN_PENDING,
        ACTIVE_REPAYMENT,
        REPAID,
        EXPIRED,
        CANCELLED,
        REFUNDABLE
    }

    // --- Immutables & Config ---
    address public immutable token;
    address public immutable creator;
    address public immutable ponsFactory;
    address public immutable protocolTreasury;
    address public immutable operator;

    uint256 public immutable campaignTargetEth;
    uint256 public immutable minContribution;
    uint256 public immutable maxContribution;   // per wallet
    uint256 public immutable fundingWindow;     // seconds, starts when the pool OPENs

    uint256 public immutable repaymentCapMultiplierBps; // 12000 = 1.20x
    uint256 public immutable lenderShareBps;            // 7500 = 75%
    uint256 public immutable creatorShareBps;           // 2300 = 23%

    uint256 public constant MIN_FUNDING_WINDOW = 10 minutes;
    uint256 public constant MAX_FUNDING_WINDOW = 30 minutes;
    uint256 public constant EXECUTION_WINDOW = 7 days;
    /// @notice The creator has this long to transfer fee rights before anyone can cancel the draft
    uint256 public constant FEE_TRANSFER_WINDOW = 1 hours;

    // --- State ---
    PoolStatus public status;
    uint256 public immutable createdAt;
    uint256 public deadline;          // set when the pool OPENs
    uint256 public totalFunded;
    FinanceSplitter public immutable splitter;
    CampaignEscrow public escrow;
    /// @notice True once Pons creatorFeeRecipient has been verified as the splitter.
    bool public feeTransferVerified;

    address[] public lenders;
    mapping(address => uint256) public contributions;
    mapping(address => bool) public hasContributed;

    // --- Events ---
    event StatusChanged(PoolStatus indexed from, PoolStatus indexed to);
    event Contributed(address indexed lender, uint256 amount, uint256 totalPoolFunded);
    event PoolFilled(address indexed splitter, address indexed escrow, uint256 totalAmount);
    event FeeTransferVerified(address indexed splitter, uint256 deadline);
    event RefundClaimed(address indexed lender, uint256 amount);
    event ExcessRefunded(address indexed lender, uint256 amount);

    constructor(
        address _token,
        address _creator,
        address _ponsFactory,
        address _protocolTreasury,
        address _operator,
        uint256 _campaignTargetEth,
        uint256 _minContribution,
        uint256 _maxContribution,
        uint256 _fundingWindow,
        uint256 _repaymentCapMultiplierBps,
        uint256 _lenderShareBps,
        uint256 _creatorShareBps
    ) {
        require(_token != address(0), "Invalid token");
        require(_creator != address(0), "Invalid creator");
        require(_ponsFactory != address(0), "Invalid factory");
        require(_protocolTreasury != address(0), "Invalid treasury");
        require(_operator != address(0), "Invalid operator");
        require(_campaignTargetEth > 0, "Invalid target");
        require(_maxContribution >= _minContribution, "Invalid contribution bounds");
        require(
            _fundingWindow >= MIN_FUNDING_WINDOW && _fundingWindow <= MAX_FUNDING_WINDOW,
            "Funding window must be 10-30 minutes"
        );

        token = _token;
        creator = _creator;
        ponsFactory = _ponsFactory;
        protocolTreasury = _protocolTreasury;
        operator = _operator;

        campaignTargetEth = _campaignTargetEth;
        minContribution = _minContribution;
        maxContribution = _maxContribution;
        fundingWindow = _fundingWindow;
        createdAt = block.timestamp;

        repaymentCapMultiplierBps = _repaymentCapMultiplierBps;
        lenderShareBps = _lenderShareBps;
        creatorShareBps = _creatorShareBps;

        splitter = new FinanceSplitter(
            _token,
            _creator,
            _ponsFactory,
            _protocolTreasury,
            _campaignTargetEth,
            _repaymentCapMultiplierBps,
            _lenderShareBps,
            _creatorShareBps
        );

        status = PoolStatus.AWAITING_FEE_TRANSFER;
        emit StatusChanged(PoolStatus.DRAFT, PoolStatus.AWAITING_FEE_TRANSFER);
    }

    function _setStatus(PoolStatus next) internal {
        emit StatusChanged(status, next);
        status = next;
    }

    // ------------------------------------------------------------------
    // Opening
    // ------------------------------------------------------------------

    /// @notice Permissionless: verifies the creator transferred Pons fee rights to the splitter, then OPENs the pool.
    function verifyFeeTransfer() external {
        require(status == PoolStatus.AWAITING_FEE_TRANSFER, "Not awaiting fee transfer");
        address recipient = IPonsV2(ponsFactory).getCreatorFeeRecipient(token);
        require(recipient == address(splitter), "Fee recipient not splitter");

        feeTransferVerified = true;
        deadline = block.timestamp + fundingWindow;
        _setStatus(PoolStatus.OPEN);
        emit FeeTransferVerified(address(splitter), deadline);
    }

    /// @notice Creator abandons a draft (or an OPEN pool with no money in it). Anyone may cancel a stale draft.
    function cancel() external {
        if (status == PoolStatus.AWAITING_FEE_TRANSFER) {
            require(
                msg.sender == creator || block.timestamp > createdAt + FEE_TRANSFER_WINDOW,
                "Only creator until fee window ends"
            );
        } else if (status == PoolStatus.OPEN) {
            require(msg.sender == creator, "Only creator");
            require(totalFunded == 0, "Pool already funded");
        } else {
            revert("Cannot cancel");
        }
        _setStatus(PoolStatus.CANCELLED);
        splitter.releaseUnfunded();
    }

    // ------------------------------------------------------------------
    // Funding
    // ------------------------------------------------------------------

    /// @notice Contribute ETH to the launch funding pool
    function contribute() external payable nonReentrant {
        require(status == PoolStatus.OPEN, "Pool not open");
        require(block.timestamp < deadline, "Pool expired");
        require(msg.value >= minContribution, "Below min contribution");
        require(
            IPonsV2(ponsFactory).getCreatorFeeRecipient(token) == address(splitter),
            "Fee recipient changed"
        );

        uint256 remainingNeeded = campaignTargetEth - totalFunded;
        uint256 walletRoom = maxContribution > contributions[msg.sender]
            ? maxContribution - contributions[msg.sender]
            : 0;
        require(walletRoom > 0, "Wallet max reached");

        uint256 acceptedAmount = msg.value;
        if (acceptedAmount > remainingNeeded) acceptedAmount = remainingNeeded;
        if (acceptedAmount > walletRoom) acceptedAmount = walletRoom;
        uint256 excess = msg.value - acceptedAmount;

        if (!hasContributed[msg.sender]) {
            lenders.push(msg.sender);
            hasContributed[msg.sender] = true;
        }

        contributions[msg.sender] += acceptedAmount;
        totalFunded += acceptedAmount;

        emit Contributed(msg.sender, acceptedAmount, totalFunded);

        // Refund any excess payment
        if (excess > 0) {
            (bool refundSuccess, ) = payable(msg.sender).call{value: excess}("");
            require(refundSuccess, "Excess refund failed");
            emit ExcessRefunded(msg.sender, excess);
        }

        // If target is met, finalize pool and deploy escrow!
        if (totalFunded >= campaignTargetEth) {
            _finalizePool();
        }
    }

    /// @dev Internal function to finalize pool: activate splitter shares and fund the CampaignEscrow
    function _finalizePool() internal {
        _setStatus(PoolStatus.FILLED);

        uint256 numLenders = lenders.length;
        uint256[] memory shares = new uint256[](numLenders);
        for (uint256 i = 0; i < numLenders; i++) {
            shares[i] = contributions[lenders[i]];
        }

        splitter.activate(lenders, shares);

        escrow = new CampaignEscrow(operator, totalFunded, block.timestamp + EXECUTION_WINDOW, address(splitter));

        (bool success, ) = payable(address(escrow)).call{value: totalFunded}("");
        require(success, "Escrow funding failed");

        emit PoolFilled(address(splitter), address(escrow), totalFunded);
        _setStatus(PoolStatus.CAMPAIGN_PENDING);
    }

    /// @notice Anyone may flag that the creator pulled fee rights away while the pool was OPEN.
    /// @dev Makes the pool refundable so lenders are never exposed to a creator bypass (brief #35).
    function reportRecipientChange() external {
        require(
            status == PoolStatus.OPEN || status == PoolStatus.CAMPAIGN_PENDING,
            "Not reportable"
        );
        require(
            IPonsV2(ponsFactory).getCreatorFeeRecipient(token) != address(splitter),
            "Recipient unchanged"
        );
        _setStatus(PoolStatus.REFUNDABLE);
        if (address(escrow) != address(0) && address(escrow).balance > 0) {
            escrow.refundOnPoolRequest();
        }
    }

    // ------------------------------------------------------------------
    // Escrow / campaign callbacks
    // ------------------------------------------------------------------

    /// @notice Escrow checks this before releasing campaign funds to the operator.
    /// @dev Checks the LIVE recipient, not just the one-time verification flag.
    function canReleaseToOperator() external view returns (bool) {
        if (status != PoolStatus.CAMPAIGN_PENDING) return false;
        if (!feeTransferVerified) return false;
        if (address(escrow) == address(0)) return false;
        if (block.timestamp > escrow.executionDeadline()) return false;
        if (IPonsV2(ponsFactory).getCreatorFeeRecipient(token) != address(splitter)) return false;
        return true;
    }

    /// @notice Called by the escrow once campaign funds were released to the operator.
    function onCampaignExecuted() external {
        require(msg.sender == address(escrow), "Only escrow");
        _setStatus(PoolStatus.ACTIVE_REPAYMENT);
    }

    /// @notice Permissionless: mirrors a fully repaid splitter into the pool status.
    function syncRepaid() external {
        require(status == PoolStatus.ACTIVE_REPAYMENT, "Not repaying");
        require(splitter.status() == FinanceSplitter.Status.REPAID, "Not repaid");
        _setStatus(PoolStatus.REPAID);
    }

    // ------------------------------------------------------------------
    // Refunds
    // ------------------------------------------------------------------

    /// @notice Lenders claim a 100% refund if the pool failed (expired / cancelled / refundable)
    function refund() external nonReentrant {
        if (status == PoolStatus.OPEN && block.timestamp >= deadline) {
            _setStatus(PoolStatus.EXPIRED);
            splitter.releaseUnfunded();
        }
        require(
            status == PoolStatus.EXPIRED ||
                status == PoolStatus.CANCELLED ||
                status == PoolStatus.REFUNDABLE,
            "Refund not allowed"
        );

        uint256 amount = contributions[msg.sender];
        require(amount > 0, "No contribution to refund");

        contributions[msg.sender] = 0;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Refund failed");

        emit RefundClaimed(msg.sender, amount);
    }

    /// @notice Returns list of all lenders who contributed
    function getLenders() external view returns (address[] memory) {
        return lenders;
    }

    /// @notice Helper to check if pool is expired
    function isExpired() external view returns (bool) {
        return block.timestamp >= deadline && status == PoolStatus.OPEN;
    }

    /// @notice Receive fallback from escrow if campaign execution failed
    receive() external payable {
        if (msg.sender == address(escrow) && status == PoolStatus.CAMPAIGN_PENDING) {
            _setStatus(PoolStatus.REFUNDABLE);
        }
    }
}
