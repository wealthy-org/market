// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title CampaignEscrow
 * @notice Holds the funded ETH principal until the campaign is executed or refundable.
 */
contract CampaignEscrow is ReentrancyGuard {
    address public immutable pool;
    address public immutable operator;
    uint256 public immutable targetAmount;

    bool public isExecuted;
    bool public isRefunded;

    event FundsReleased(address indexed operator, uint256 amount);
    event FundsRefundedToPool(address indexed pool, uint256 amount);

    modifier onlyOperator() {
        require(msg.sender == operator, "Only operator");
        _;
    }

    modifier onlyPool() {
        require(msg.sender == pool, "Only pool");
        _;
    }

    constructor(address _operator, uint256 _targetAmount) {
        require(_operator != address(0), "Invalid operator");
        pool = msg.sender;
        operator = _operator;
        targetAmount = _targetAmount;
    }

    receive() external payable {}

    /// @notice Releases campaign funds to operator wallet for DEX Screener payment
    function releaseToOperator() external onlyOperator nonReentrant {
        require(!isExecuted && !isRefunded, "Already finalized");
        isExecuted = true;
        uint256 bal = address(this).balance;
        (bool success, ) = payable(operator).call{value: bal}("");
        require(success, "Transfer failed");
        emit FundsReleased(operator, bal);
    }

    /// @notice In case of execution failure, refunds all funds back to FundingPool
    function refundToPool() external onlyOperator nonReentrant {
        require(!isExecuted && !isRefunded, "Already finalized");
        isRefunded = true;
        uint256 bal = address(this).balance;
        (bool success, ) = payable(pool).call{value: bal}("");
        require(success, "Transfer failed");
        emit FundsRefundedToPool(pool, bal);
    }
}
