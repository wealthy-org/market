// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IFundingPool {
    function canReleaseToOperator() external view returns (bool);
    function onCampaignExecuted() external;
}

interface IVendorRefundSink {
    function depositVendorRefund() external payable;
}

/**
 * @title CampaignEscrow
 * @notice Holds the funded ETH principal until the campaign is executed or refundable.
 * @dev Release is gated on the LIVE Pons fee recipient being the splitter (brief #16) and an execution
 * deadline (brief #18). After release the operator must publish proof of the vendor purchase, and any vendor
 * refund is returned pro-rata to lenders through the splitter.
 */
contract CampaignEscrow is ReentrancyGuard {
    address public immutable pool;
    address public immutable operator;
    address public immutable splitter;
    uint256 public immutable targetAmount;
    uint256 public immutable executionDeadline;

    bool public isExecuted;
    bool public isRefunded;

    /// @notice Proof of the DEX Screener purchase (hash of receipt + public URI), brief #18
    bytes32 public proofHash;
    string public proofUri;

    event FundsReleased(address indexed operator, uint256 amount);
    event FundsRefundedToPool(address indexed pool, uint256 amount);
    event CampaignProofSubmitted(bytes32 indexed proofHash, string uri);
    event VendorRefundForwarded(uint256 amount);

    modifier onlyOperator() {
        require(msg.sender == operator, "Only operator");
        _;
    }

    modifier onlyPool() {
        require(msg.sender == pool, "Only pool");
        _;
    }

    constructor(address _operator, uint256 _targetAmount, uint256 _executionDeadline, address _splitter) {
        require(_operator != address(0), "Invalid operator");
        require(_splitter != address(0), "Invalid splitter");
        require(_executionDeadline > block.timestamp, "Invalid deadline");
        pool = msg.sender;
        operator = _operator;
        splitter = _splitter;
        targetAmount = _targetAmount;
        executionDeadline = _executionDeadline;
    }

    receive() external payable {}

    /// @notice Releases campaign funds to operator wallet for DEX Screener payment.
    function releaseToOperator() external onlyOperator nonReentrant {
        require(!isExecuted && !isRefunded, "Already finalized");
        require(block.timestamp <= executionDeadline, "Execution window expired");
        require(IFundingPool(pool).canReleaseToOperator(), "Fee transfer not verified");
        isExecuted = true;
        uint256 bal = address(this).balance;
        (bool success, ) = payable(operator).call{value: bal}("");
        require(success, "Transfer failed");
        emit FundsReleased(operator, bal);
        IFundingPool(pool).onCampaignExecuted();
    }

    /// @notice Operator publishes proof of the external vendor purchase after release.
    function submitCampaignProof(bytes32 _proofHash, string calldata _uri) external onlyOperator {
        require(isExecuted, "Not executed");
        require(proofHash == bytes32(0), "Proof already submitted");
        require(_proofHash != bytes32(0), "Empty proof");
        proofHash = _proofHash;
        proofUri = _uri;
        emit CampaignProofSubmitted(_proofHash, _uri);
    }

    /// @notice A refunded vendor payment returns here and is split pro-rata to lenders.
    function forwardVendorRefund() external payable onlyOperator nonReentrant {
        require(isExecuted && !isRefunded, "Not refundable");
        require(msg.value > 0, "No refund");
        IVendorRefundSink(splitter).depositVendorRefund{value: msg.value}();
        emit VendorRefundForwarded(msg.value);
    }

    /// @notice In case of execution failure, refunds all funds back to FundingPool
    function refundToPool() external onlyOperator nonReentrant {
        _refundToPool();
    }

    /// @notice Pool-initiated refund (e.g. fee recipient changed before release)
    function refundOnPoolRequest() external onlyPool nonReentrant {
        _refundToPool();
    }

    /// @notice Permissionless refund after the execution deadline so lender funds are never stuck.
    function refundAfterDeadline() external nonReentrant {
        require(block.timestamp > executionDeadline, "Window still active");
        _refundToPool();
    }

    function _refundToPool() internal {
        require(!isExecuted && !isRefunded, "Already finalized");
        isRefunded = true;
        uint256 bal = address(this).balance;
        (bool success, ) = payable(pool).call{value: bal}("");
        require(success, "Transfer failed");
        emit FundsRefundedToPool(pool, bal);
    }
}
