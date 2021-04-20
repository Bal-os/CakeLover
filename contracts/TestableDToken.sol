// SPDX-License-Identifier: MIT

pragma solidity 0.8.0;

import "./DToken.sol";

contract TastableDToken is DToken {
    constructor(address _address) DToken(_address) {}

    function transfer(address from, address to, uint256 tokenId) external {
        super._transfer(from, to, tokenId);
    }
}