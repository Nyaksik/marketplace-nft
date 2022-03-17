//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

string constant BASE_URL = "https://ipfs.io/ipfs/";
string constant NAME = "TokenForMarket";
string constant SYMBOL = "TFM";

contract TokenForMarket is ERC721URIStorage, Ownable {
    uint256 private _tokenIds;
    address public minter;

    constructor(address _minter) ERC721(NAME, SYMBOL) {
        minter = _minter;
    }

    modifier onlyMinter() {
        require(msg.sender == minter, "Only minter can do this.");
        _;
    }

    function _baseURI() internal pure override returns (string memory) {
        return BASE_URL;
    }

    function getBaseURI() external pure returns (string memory) {
        return _baseURI();
    }

    function changeMinterRole(address _newMinter) external onlyOwner {
        minter = _newMinter;
    }

    function mint(address _account, string memory _tokenURI)
        external
        onlyMinter
        returns (uint256)
    {
        _tokenIds++;
        _mint(_account, _tokenIds);
        _setTokenURI(_tokenIds, _tokenURI);
        return _tokenIds;
    }
}
