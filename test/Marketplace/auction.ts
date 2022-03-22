import { expect } from "chai";
import { ethers } from "hardhat";

export default (): void => {
  it("MARKETPLACE_AUCTION: ListItemOnAuction works correctly", async function (): Promise<void> {
    await this.instanceERC721.changeMinterRole(this.instance.address);
    await this.instance.createItem(this.testCID);
    await this.instanceERC721.approve(this.instance.address, 1);
    await this.instance.listItemOnAuction(1, this.basePrice);

    const blockNumber = await ethers.provider.getBlockNumber();
    const block = await ethers.provider.getBlock(blockNumber);
    const [
      owner,
      status,
      currentBid,
      currentBidder,
      tokenId,
      numberOfBets,
      startTime,
    ] = await this.instance.lots(1);
    const resultData = [
      owner,
      status,
      String(currentBid),
      currentBidder,
      +tokenId,
      +numberOfBets,
      +startTime,
    ];
    const expectData = [
      this.owner.address,
      1,
      this.basePrice,
      this.zeroAddress,
      1,
      0,
      block.timestamp,
    ];

    expect(JSON.stringify(expectData)).to.eq(JSON.stringify(resultData));
  });
  it("MARKETPLACE_AUCTION: Only the owner can do this", async function (): Promise<void> {
    await this.instanceERC721.changeMinterRole(this.instance.address);
    await this.instance.createItem(this.testCID);
    await this.instanceERC721.approve(this.instance.address, 1);

    await expect(
      this.instance.connect(this.addr1).listItemOnAuction(1, this.basePrice)
    ).to.be.revertedWith("NotOwner()");
  });
  it("MARKETPLACE_AUCTION: MakeBet works correctly", async function (): Promise<void> {
    await this.instanceERC721.changeMinterRole(this.instance.address);
    await this.instance.createItem(this.testCID);
    await this.instanceERC721.approve(this.instance.address, 1);
    await this.instance.listItemOnAuction(1, this.basePrice);

    const bet = await this.instance
      .connect(this.addr1)
      .makeBet(1, { value: this.bigPrice });

    await bet.wait();

    const [_, __, currentBid, currentBidder, ___, numberOfBets] =
      await this.instance.lots(1);
    const resultData = [String(currentBid), currentBidder, +numberOfBets];
    const expectData = [this.bigPrice, this.addr1.address, 1];

    expect(JSON.stringify(expectData)).to.eq(JSON.stringify(resultData));
  });
  it("MARKETPLACE_AUCTION: Previous bid will return bidder", async function (): Promise<void> {
    await this.instanceERC721.changeMinterRole(this.instance.address);
    await this.instance.createItem(this.testCID);
    await this.instanceERC721.approve(this.instance.address, 1);
    await this.instance.listItemOnAuction(1, this.lowPrice);

    const bet1 = await this.instance
      .connect(this.addr1)
      .makeBet(1, { value: this.basePrice });

    await bet1.wait();

    const bet2 = await this.instance.makeBet(1, { value: this.bigPrice });

    await bet2.wait();

    await expect(() => bet2).to.changeEtherBalances(
      [this.instance, this.addr1, this.owner],
      [this.bigPrice - this.basePrice, this.basePrice, -this.bigPrice]
    );
  });
  it("MARKETPLACE_AUCTION: Lot must be in progress", async function (): Promise<void> {
    await this.instanceERC721.changeMinterRole(this.instance.address);
    await this.instance.createItem(this.testCID);
    await this.instanceERC721.approve(this.instance.address, 1);
    await this.instance.listItemOnAuction(1, this.basePrice);
    await ethers.provider.send("evm_increaseTime", [600000]);

    await expect(
      this.instance.connect(this.addr1).makeBet(1, { value: this.bigPrice })
    ).to.be.revertedWith("Auction not over.");
  });
  it("MARKETPLACE_AUCTION: Lot must be in progress", async function (): Promise<void> {
    await expect(
      this.instance.connect(this.addr1).makeBet(1, { value: this.bigPrice })
    ).to.be.revertedWith("LotNotInProgress()");
  });
  it("MARKETPLACE_AUCTION: Bet amount must be greater than the current bet", async function (): Promise<void> {
    await this.instanceERC721.changeMinterRole(this.instance.address);
    await this.instance.createItem(this.testCID);
    await this.instanceERC721.approve(this.instance.address, 1);
    await this.instance.listItemOnAuction(1, this.basePrice);

    await expect(
      this.instance.connect(this.addr1).makeBet(1, { value: this.lowPrice })
    ).to.be.revertedWith("IncorrectAmount(1000000, 1000)");
  });
  it("MARKETPLACE_AUCTION: FinishAuction works correctly", async function (): Promise<void> {
    await this.instanceERC721.changeMinterRole(this.instance.address);
    await this.instance.createItem(this.testCID);
    await this.instanceERC721.approve(this.instance.address, 1);
    await this.instance.listItemOnAuction(1, this.lowPrice);

    const bet1 = await this.instance
      .connect(this.addr1)
      .makeBet(1, { value: this.basePrice });

    await bet1.wait();

    const bet2 = await this.instance
      .connect(this.addr2)
      .makeBet(1, { value: this.bigPrice });

    await bet2.wait();

    const bet3 = await this.instance
      .connect(this.addr3)
      .makeBet(1, { value: 1e8 });

    await bet3.wait();

    await ethers.provider.send("evm_increaseTime", [600000]);

    const finish = await this.instance.finishAuction(1);

    await finish.wait();

    const balance = await this.instanceERC721.balanceOf(this.addr3.address);
    const [_, status] = await this.instance.lots(1);

    await expect(() => finish).to.changeEtherBalances(
      [this.instance, this.owner],
      [-1e8, 1e8]
    );
    expect(balance).to.eq(1);
    expect(status).to.eq(2);
  });
  it("MARKETPLACE_AUCTION: Lot must be in progress", async function (): Promise<void> {
    await expect(this.instance.finishAuction(1)).to.be.revertedWith(
      "LotNotInProgress()"
    );
  });
  it("MARKETPLACE_AUCTION: Lot must be in progress", async function (): Promise<void> {
    await this.instanceERC721.changeMinterRole(this.instance.address);
    await this.instance.createItem(this.testCID);
    await this.instanceERC721.approve(this.instance.address, 1);
    await this.instance.listItemOnAuction(1, this.basePrice);

    await expect(
      this.instance.connect(this.addr1).finishAuction(1)
    ).to.be.revertedWith("Auction not over.");
  });
  it("MARKETPLACE_AUCTION: CancelAuction works correctly", async function (): Promise<void> {
    await this.instanceERC721.changeMinterRole(this.instance.address);
    await this.instance.createItem(this.testCID);
    await this.instanceERC721.approve(this.instance.address, 1);
    await this.instance.listItemOnAuction(1, this.lowPrice);

    const bet1 = await this.instance
      .connect(this.addr1)
      .makeBet(1, { value: this.basePrice });

    await bet1.wait();

    const bet2 = await this.instance
      .connect(this.addr2)
      .makeBet(1, { value: this.bigPrice });

    await bet2.wait();

    await ethers.provider.send("evm_increaseTime", [600000]);

    const finish = await this.instance.finishAuction(1);

    await finish.wait();

    const [_, status] = await this.instance.lots(1);
    const balance = await this.instanceERC721.balanceOf(this.owner.address);

    await expect(() => finish).to.changeEtherBalances(
      [this.instance, this.addr2],
      [-this.bigPrice, this.bigPrice]
    );
    expect(status).to.eq(3);
    expect(balance).to.eq(1);
  });
};
