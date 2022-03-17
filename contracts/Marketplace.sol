//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "./TokenForMarket.sol";

contract Marketplace {
    enum LotStatus {
        NONE,
        IN_PROGRESS,
        FINISHED,
        CANCELED
    }

    struct Offer {
        address owner;
        LotStatus status;
        uint256 price;
        uint256 tokenId;
    }

    struct Lot {
        address owner;
        LotStatus status;
        uint256 currentBid;
        address currentBidder;
        uint256 tokenId;
        uint256 numberOfBets;
        uint256 startTime;
    }

    uint256 public constant AUCTION_DURATION = 3 days;
    uint256 public constant MINIMUM_NUMBER_OF_BETS = 2;

    mapping(uint256 => Offer) public offers;
    mapping(uint256 => Lot) public lots;

    TokenForMarket private _tokenERC721;

    constructor(address _token) {
        _tokenERC721 = TokenForMarket(_token);
    }

    function getNFTContractAddress()
        external
        view
        returns (address tokenAddress)
    {
        tokenAddress = address(_tokenERC721);
    }

    function getOffer(uint256 _id) external view returns (Offer memory) {
        return offers[_id];
    }

    function getLot(uint256 _id) external view returns (Lot memory) {
        return lots[_id];
    }

    function createItem(string memory _tokenURI)
        external
        returns (uint256 tokenId)
    {
        tokenId = _tokenERC721.mint(msg.sender, _tokenURI);
    }

    function listItem(uint256 _tokenId, uint256 _price) external {
        require(
            _tokenERC721.ownerOf(_tokenId) == msg.sender,
            "Only the owner can do this."
        );
        _tokenERC721.transferFrom(msg.sender, address(this), _tokenId);
        Offer memory offer = Offer({
            owner: msg.sender,
            status: LotStatus.IN_PROGRESS,
            price: _price,
            tokenId: _tokenId
        });
        offers[_tokenId] = offer;
    }

    function buyItem(uint256 _tokenId) external payable {
        Offer storage offer = offers[_tokenId];
        require(
            offer.status == LotStatus.IN_PROGRESS,
            "Lot must be in progress."
        );
        require(offer.price == msg.value, "Incorrect amount.");
        offer.status = LotStatus.FINISHED;
        payable(offer.owner).transfer(msg.value);
        _tokenERC721.transferFrom(address(this), msg.sender, _tokenId);
    }

    function cancel(uint256 _tokenId) external {
        Offer storage offer = offers[_tokenId];
        require(
            offer.status == LotStatus.IN_PROGRESS,
            "Lot must be in progress."
        );
        require(offer.owner == msg.sender, "Only the owner can do this.");
        offer.status = LotStatus.CANCELED;
        _tokenERC721.transferFrom(
            address(this),
            offers[_tokenId].owner,
            _tokenId
        );
    }

    function listItemOnAuction(uint256 _tokenId, uint256 _price) external {
        require(
            _tokenERC721.ownerOf(_tokenId) == msg.sender,
            "Only the owner can do this."
        );
        _tokenERC721.transferFrom(msg.sender, address(this), _tokenId);
        Lot memory lot = Lot({
            owner: msg.sender,
            status: LotStatus.IN_PROGRESS,
            currentBid: _price,
            currentBidder: address(0x0),
            tokenId: _tokenId,
            numberOfBets: 0,
            startTime: block.timestamp
        });
        lots[_tokenId] = lot;
    }

    function makeBet(uint256 _tokenId) external payable {
        Lot storage lot = lots[_tokenId];
        require(
            lot.status == LotStatus.IN_PROGRESS &&
                block.timestamp <= lot.startTime + AUCTION_DURATION,
            "Lot must be in progress."
        );
        require(
            msg.value > lot.currentBid,
            "Your bid is less than the current bid."
        );
        if (lot.currentBidder != address(0x0)) {
            payable(lot.currentBidder).transfer(lot.currentBid);
        }
        lot.currentBidder = msg.sender;
        lot.currentBid = msg.value;
        lot.numberOfBets++;
    }

    function finishAuction(uint256 _tokenId) public {
        Lot storage lot = lots[_tokenId];
        require(
            lot.status == LotStatus.IN_PROGRESS &&
                block.timestamp >= lot.startTime + AUCTION_DURATION,
            "Lot must be in progress."
        );
        if (lot.numberOfBets <= MINIMUM_NUMBER_OF_BETS) {
            _cancelAuction(_tokenId, lot);
        } else {
            lot.status = LotStatus.FINISHED;
            _tokenERC721.transferFrom(
                address(this),
                lot.currentBidder,
                _tokenId
            );
            payable(lot.owner).transfer(lot.currentBid);
        }
    }

    function _cancelAuction(uint256 _tokenId, Lot storage lot) private {
        lot.status = LotStatus.CANCELED;
        payable(lot.currentBidder).transfer(lot.currentBid);
        _tokenERC721.transferFrom(address(this), lot.owner, _tokenId);
    }
}
