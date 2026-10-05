// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../interfaces/IPonsV2.sol";

contract MockPonsV2 is IPonsV2 {
    mapping(address => address) public creatorFeeRecipients;
    mapping(address => uint256) public pendingFeeBalances;

    event FeeRecipientTransferred(address indexed token, address indexed oldRecipient, address indexed newRecipient);
    event FeesAccrued(address indexed recipient, uint256 amount);

    function setInitialRecipient(address token, address creator) external {
        creatorFeeRecipients[token] = creator;
    }

    /// @dev Test-only: simulates an unexpected recipient change
    function forceRecipient(address token, address recipient) external {
        creatorFeeRecipients[token] = recipient;
    }

    function transferCreatorFeeRecipient(address token, address newRecipient) external override {
        address current = creatorFeeRecipients[token];
        require(msg.sender == current, "Only current recipient can transfer");
        require(newRecipient != address(0), "Invalid recipient");

        creatorFeeRecipients[token] = newRecipient;
        emit FeeRecipientTransferred(token, current, newRecipient);
    }

    function getCreatorFeeRecipient(address token) external view override returns (address) {
        return creatorFeeRecipients[token];
    }

    /// @notice Simulates trading fee generation on Pons curve
    function simulateTradingFees(address recipient) external payable {
        pendingFeeBalances[recipient] += msg.value;
        emit FeesAccrued(recipient, msg.value);
    }

    /// @notice Claims accrued fees for recipient
    function claim(address recipient) external override returns (uint256) {
        uint256 amount = pendingFeeBalances[recipient];
        require(amount > 0, "No pending fees");
        pendingFeeBalances[recipient] = 0;

        (bool success, ) = payable(recipient).call{value: amount}("");
        require(success, "Pons claim transfer failed");

        return amount;
    }

    receive() external payable {}
}
