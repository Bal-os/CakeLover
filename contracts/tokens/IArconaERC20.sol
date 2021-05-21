// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.0;

interface IArconaERC20 {
    /// @notice Add address that can mint tokens.
    /// @param _newOwner New address
    function addOwnership(address _newOwner) external;

    /// @notice Remove address that can mint tokens.
    /// @param _owner New address
    function removeOwnership(address _owner) external;

    /// @notice Mint tokens
    /// @param _account The address to which the tokens will be transferred
    /// @param _amount The amount of tokens to create
    function mint(address _account, uint256 _amount) external;
}
