//SPDX-License-Identifier: UNLICENSED

pragma solidity 0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DToken is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    
    mapping(uint256 => uint) gisIds;
    
    event CountersPreIncremented(uint256 counter);
    event SetedGIS(uint256 id, uint gis);


    constructor() ERC721("DToken", "DTK") {}


    function mint(address _receiver, string memory _tokenURI, uint _gisId) external onlyOwner returns (uint256) {
        emit CountersPreIncremented(_tokenIds.current());
        
        _tokenIds.increment();

        uint256 _newNftTokenId = _tokenIds.current();
        _mint(_receiver, _newNftTokenId);
        _setTokenURI(_newNftTokenId, _tokenURI);
        gisIds[_newNftTokenId] = _gisId;
        
        emit SetedGIS(_newNftTokenId, _gisId);

        return _newNftTokenId;
    }
    
    
    function transferStuckToken(uint256 _id, address _to) external onlyOwner {
        address _thisAddress = address(this);
        
        require(ownerOf(_id) == _thisAddress, "DTK: tokens not accessed to transfer");
        
        _transfer(_thisAddress, _to, _id);
    }
    
    
    function transferStuckERC20(IERC20 _token, address _to, uint256 _amount) external onlyOwner {
        address _thisAddress = address(this);

        _token.transferFrom(_thisAddress, _to, _amount);
    }
    
    
    function transferInitial(address payable _to, uint256 _amount) external onlyOwner {
        _to.transfer(_amount);
    }
}
