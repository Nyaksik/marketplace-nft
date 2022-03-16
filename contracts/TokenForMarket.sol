//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

string constant BASE_URL = "https://ipfs.io/ipfs/";
string constant NAME = "TokenForMarket";
string constant SYMBOL = "TFM";

contract TokenForMarket is ERC721URIStorage, AccessControl {
    bytes32 private constant OWNER_ROLE = keccak256("OWNER_ROLE");
    bytes32 private constant MINTER_ROLE = keccak256("MINTER_ROLE");

    uint256 private _tokenIds;
    address public minter;

    constructor(address _minter) ERC721(NAME, SYMBOL) {
        _setupRole(OWNER_ROLE, msg.sender);
        _setupRole(MINTER_ROLE, _minter);
        minter = _minter;
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _baseURI() internal pure override returns (string memory) {
        return BASE_URL;
    }

    function getBaseURI() external pure returns (string memory) {
        return _baseURI();
    }

    function changeMinterRole(address _newMinter)
        external
        onlyRole(OWNER_ROLE)
    {
        _revokeRole(MINTER_ROLE, minter);
        _grantRole(MINTER_ROLE, _newMinter);
        minter = _newMinter;
    }

    function mint(address _account, string memory _tokenURI)
        external
        onlyRole(MINTER_ROLE)
        returns (uint256)
    {
        _tokenIds++;
        _mint(_account, _tokenIds);
        _setTokenURI(_tokenIds, _tokenURI);
        return _tokenIds;
    }
}
