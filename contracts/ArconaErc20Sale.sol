// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./tokens/IArconaERC20.sol";

/// @notice Contract exchange ERC20 tokens to another ERC20 tokens
contract ArconaERC20Sale is Ownable {
    using SafeMath for uint;

    IArconaERC20 public token;
    IERC20 public exchangeToken;

    /// @notice The price of one token that the user will receive (Wei)
    uint256 public tokenPrice = 0;

    /// @param _tokenAddress Contract address that containing the tokens that the user will receive
    /// @param _exchangeTokenAddress Contract address containing the tokens to be given by the user
    constructor(address _tokenAddress, address _exchangeTokenAddress) {
        token = IArconaERC20(_tokenAddress);
        exchangeToken = IERC20(_exchangeTokenAddress);
    }

    /// @notice Set the price of one token that the user will receive
    /// @param _newPrice Token price (Wei)
    function setTokenPrice(uint256 _newPrice) external onlyOwner {
        tokenPrice = _newPrice;
    }

    /// @notice Exchange one token to another
    /// @param _exchangeTokensAmount Token amount (Wei)
    function exchange(uint256 _exchangeTokensAmount) external {
        require(tokenPrice > 0, "[E-85] - Token price is not set.");

        uint256 _tokensToMint = calculateTokensAmountAfterExchange(_exchangeTokensAmount);
        require(_tokensToMint >= 1000000000000000000, "[E-86] - Exchange amount to low.");

        require(exchangeToken.transferFrom(msg.sender, address(this), _exchangeTokensAmount), "[E-87] - Failed to transfer token.");
        token.mint(msg.sender, _tokensToMint);
    }

    /// @notice Calculate tokens amount that user receive from _exchangeTokensAmount
    /// @param _exchangeTokensAmount Token amount (Wei)
    function calculateTokensAmountAfterExchange(uint256 _exchangeTokensAmount) public view returns(uint256) {
        return _exchangeTokensAmount.mul(1000000000000000000).div(tokenPrice);
    }
}
