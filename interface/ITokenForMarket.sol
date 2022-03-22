//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

interface ITokenForMarket {
    function mint(address _account, string memory _tokenURI)
        external
        returns (uint256);

    function ownerOf(uint256 tokenId) external view returns (address owner);

    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) external;
}
