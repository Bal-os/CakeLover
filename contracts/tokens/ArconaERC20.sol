// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IArconaERC20.sol";

/// @notice Contract describe token. Specified address can mint() tokens.
contract ArconaERC20 is IArconaERC20, ERC20('Arcona', 'A') {
    mapping(address => bool) private owners;

    constructor () {
        owners[msg.sender] = true;
    }

    modifier onlyOwner() {
        require(owners[msg.sender], "[E-786] - Caller is not the owner.");
        _;
    }

    /// @notice Add address that can mint tokens.
    /// @param _newOwner New address
    function addOwnership(address _newOwner) external override onlyOwner {
        require(_newOwner != address(0), "[E-787] - New owner is the zero address");
        owners[_newOwner] = true;
    }

    /// @notice Remove address that can mint tokens.
    /// @param _owner New address
    function removeOwnership(address _owner) external override onlyOwner {
        owners[_owner] = false;
    }

    /// @notice Mint tokens
    /// @param _account The address to which the tokens will be transferred
    /// @param _amount The amount of tokens to create
    function mint(address _account, uint256 _amount) external override onlyOwner {
        _mint(_account, _amount);
    }
}
