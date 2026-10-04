// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./FinanceSplitter.sol";
import "./CampaignEscrow.sol";

/**
 * @title FundingPool
 * @notice All-or-nothing pooled funding contract for a standardized token launch campaign (e.g. DEX Screener $299).
 */
contract FundingPool is ReentrancyGuard {
    enum PoolStatus {
        OPEN,
        FILLED,
        REFUNDABLE,
        CLOSED
    }

    // --- Immutables & Config ---
    address public immutable token;
    address public immutable creator;
    address public immutable ponsFactory;
    address public immutable protocolTreasury;
    address public immutable operator;

    uint256 public immutable campaignTargetEth;
    uint256 public immutable minContribution;
    uint256 public immutable deadline;

    uint256 public immutable repaymentCapMultiplierBps; // 12000 = 1.20x
    uint256 public immutable lenderShareBps;            // 7000 = 70%
    uint256 public immutable creatorShareBps;           // 2500 = 25%

    // --- State ---
    PoolStatus public status;
    uint256 public totalFunded;
    FinanceSplitter public splitter;
    CampaignEscrow public escrow;

    address[] public lenders;
    mapping(address => uint256) public contributions;
    mapping(address => bool) public hasContributed;

    // --- Events ---
    event Contributed(address indexed lender, uint256 amount, uint256 totalPoolFunded);
    event PoolFilled(address indexed splitter, address indexed escrow, uint256 totalAmount);
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
        uint256 _durationSeconds,
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

        token = _token;
        creator = _creator;
        ponsFactory = _ponsFactory;
        protocolTreasury = _protocolTreasury;
        operator = _operator;

        campaignTargetEth = _campaignTargetEth;
        minContribution = _minContribution;
        deadline = block.timestamp + _durationSeconds;

        repaymentCapMultiplierBps = _repaymentCapMultiplierBps;
        lenderShareBps = _lenderShareBps;
        creatorShareBps = _creatorShareBps;

        status = PoolStatus.OPEN;
    }

    /// @notice Contribute ETH to the launch funding pool
    function contribute() external payable nonReentrant {
        require(status == PoolStatus.OPEN, "Pool not open");
        require(block.timestamp < deadline, "Pool expired");
        require(msg.value >= minContribution, "Below min contribution");

        uint256 remainingNeeded = campaignTargetEth - totalFunded;
        uint256 acceptedAmount = msg.value;
        uint256 excess = 0;

        if (msg.value > remainingNeeded) {
            acceptedAmount = remainingNeeded;
            excess = msg.value - remainingNeeded;
        }

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

        // If target is met, finalize pool and deploy contracts!
        if (totalFunded >= campaignTargetEth) {
            _finalizePool();
        }
    }

    /// @dev Internal function to finalize pool, deploy FinanceSplitter and CampaignEscrow
    function _finalizePool() internal {
        status = PoolStatus.FILLED;

        uint256 numLenders = lenders.length;
        uint256[] memory shares = new uint256[](numLenders);
        for (uint256 i = 0; i < numLenders; i++) {
            shares[i] = contributions[lenders[i]];
        }

        // 1. Deploy FinanceSplitter
        splitter = new FinanceSplitter(
            token,
            creator,
            ponsFactory,
            protocolTreasury,
            totalFunded,
            repaymentCapMultiplierBps,
            lenderShareBps,
            creatorShareBps,
            lenders,
            shares
        );

        // 2. Deploy CampaignEscrow
        escrow = new CampaignEscrow(operator, totalFunded);

        // 3. Transfer principal to escrow
        (bool success, ) = payable(address(escrow)).call{value: totalFunded}("");
        require(success, "Escrow funding failed");

        emit PoolFilled(address(splitter), address(escrow), totalFunded);
    }

    /// @notice Allows lenders to claim a 100% refund if the pool fails to meet its target before deadline
    function refund() external nonReentrant {
        bool hasExpired = block.timestamp >= deadline && status == PoolStatus.OPEN;
        bool isRefundableStatus = status == PoolStatus.REFUNDABLE;
        require(hasExpired || isRefundableStatus, "Refund not allowed");

        if (status == PoolStatus.OPEN) {
            status = PoolStatus.REFUNDABLE;
        }

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
        if (msg.sender == address(escrow)) {
            status = PoolStatus.REFUNDABLE;
        }
    }
}
