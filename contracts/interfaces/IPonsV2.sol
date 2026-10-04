// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IPonsV2 {
    /// @notice Transfers future creator fee recipient to a new address
    /// @dev Only callable by the current recipient
    function transferCreatorFeeRecipient(address token, address newRecipient) external;

    /// @notice Returns current creator fee recipient for a token
    function getCreatorFeeRecipient(address token) external view returns (address);

    /// @notice Claims accrued fees for a recipient from Pons fee escrow
    function claim(address recipient) external returns (uint256);
}
