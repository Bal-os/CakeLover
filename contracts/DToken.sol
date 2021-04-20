// SPDX-License-Identifier: MIT

pragma solidity 0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract DToken is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    
    mapping(uint256 => uint256) fees;
    
    Counters.Counter private _tokenIds;
    address internal receiver;
    IERC20 internal payToken;

    event CountersPreIncremented(uint256 counter);
    event SetedFee(uint256 id, uint256 fee);
    event Receiver(address receiver);
    event Token(address payToken);
    

    constructor(address _token) ERC721("DToken", "DTK") {
        setPayToken(_token);
    }
    
    
    function setReceiver(address _receiver) external onlyOwner {
        receiver = _receiver;
        
        emit Receiver(_receiver);
    }
    
    
    function setPayToken(address _token) public onlyOwner {
        payToken = IERC20(_token);
        
        emit Token(_token);
    }
    
    
    function tokenFee(uint256 _tokenId) public view returns (uint256) {
        uint256 _fee = fees[_tokenId];
        
        require(_exists(_tokenId), "DTK: imposible to get fee of non-existent token");
        
        return _fee;
    }
    

    function mint(string memory _tokenURI, uint256 _fee) external onlyOwner returns (uint256) {
        emit CountersPreIncremented(_tokenIds.current());
        
        _tokenIds.increment();
        uint256 _newNftTokenId = _tokenIds.current();
        
        fees[_newNftTokenId] = _fee;
        _mint(receiver, _newNftTokenId);
        _setTokenURI(_newNftTokenId, _tokenURI);

        emit SetedFee(_newNftTokenId, _fee);

        return _newNftTokenId;
    }
    
    
    function transferStuckToken(uint256 _id, address _to) external {
        address _thisAddress = address(this);
        
        require(ownerOf(_id) == _thisAddress, "DTK: tokens not accessed to transfer");
        
        _transfer(_thisAddress, _to, _id);
    }
    
    
    function _transfer(address from, address to, uint256 tokenId) internal override {
        uint256 _amound = fees[tokenId];
        require(payToken.balanceOf(to) > _amound, "DTK: transfer amount exceeds balance");
        
        super._transfer(from, to, tokenId);
        
        payToken.transferFrom(to, from, _amound);
    }

}
