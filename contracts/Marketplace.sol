//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "../interface/ITokenForMarket.sol";

error NotOwner();
error LotNotInProgress();
error IncorrectAmount(uint256 price, uint256 amount);

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

    address public tokenERC721;
    uint256 public constant AUCTION_DURATION = 3 days;
    uint256 public constant MINIMUM_NUMBER_OF_BETS = 2;

    mapping(uint256 => Offer) public offers;
    mapping(uint256 => Lot) public lots;

    constructor(address _token) {
        tokenERC721 = _token;
    }

    function createItem(string memory _tokenURI)
        external
        returns (uint256 tokenId)
    {
        tokenId = ITokenForMarket(tokenERC721).mint(msg.sender, _tokenURI);
    }

    function listItem(uint256 _tokenId, uint256 _price) external {
        if (ITokenForMarket(tokenERC721).ownerOf(_tokenId) != msg.sender)
            revert NotOwner();
        ITokenForMarket(tokenERC721).transferFrom(
            msg.sender,
            address(this),
            _tokenId
        );
        offers[_tokenId] = Offer({
            owner: msg.sender,
            status: LotStatus.IN_PROGRESS,
            price: _price,
            tokenId: _tokenId
        });
    }

    function buyItem(uint256 _tokenId) external payable {
        Offer storage offer = offers[_tokenId];
        if (offer.status != LotStatus.IN_PROGRESS) revert LotNotInProgress();
        if (offer.price != msg.value)
            revert IncorrectAmount({price: offer.price, amount: msg.value});
        offer.status = LotStatus.FINISHED;
        payable(offer.owner).transfer(msg.value);
        ITokenForMarket(tokenERC721).transferFrom(
            address(this),
            msg.sender,
            _tokenId
        );
    }

    function cancel(uint256 _tokenId) external {
        Offer storage offer = offers[_tokenId];
        if (offer.status != LotStatus.IN_PROGRESS) revert LotNotInProgress();
        if (offer.owner != msg.sender) revert NotOwner();
        offer.status = LotStatus.CANCELED;
        ITokenForMarket(tokenERC721).transferFrom(
            address(this),
            offers[_tokenId].owner,
            _tokenId
        );
    }

    function listItemOnAuction(uint256 _tokenId, uint256 _price) external {
        if (ITokenForMarket(tokenERC721).ownerOf(_tokenId) != msg.sender)
            revert NotOwner();
        ITokenForMarket(tokenERC721).transferFrom(
            msg.sender,
            address(this),
            _tokenId
        );
        lots[_tokenId] = Lot({
            owner: msg.sender,
            status: LotStatus.IN_PROGRESS,
            currentBid: _price,
            currentBidder: address(0x0),
            tokenId: _tokenId,
            numberOfBets: 0,
            startTime: block.timestamp
        });
    }

    function makeBet(uint256 _tokenId) external payable {
        Lot storage lot = lots[_tokenId];
        require(
            block.timestamp <= lot.startTime + AUCTION_DURATION,
            "Auction not over."
        );
        if (lot.status != LotStatus.IN_PROGRESS) revert LotNotInProgress();
        if (msg.value < lot.currentBid)
            revert IncorrectAmount({price: lot.currentBid, amount: msg.value});
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
            block.timestamp >= lot.startTime + AUCTION_DURATION,
            "Auction not over."
        );
        if (lot.status != LotStatus.IN_PROGRESS) revert LotNotInProgress();
        if (lot.numberOfBets <= MINIMUM_NUMBER_OF_BETS) {
            _cancelAuction(_tokenId, lot);
        } else {
            lot.status = LotStatus.FINISHED;
            ITokenForMarket(tokenERC721).transferFrom(
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
        ITokenForMarket(tokenERC721).transferFrom(
            address(this),
            lot.owner,
            _tokenId
        );
    }
}
