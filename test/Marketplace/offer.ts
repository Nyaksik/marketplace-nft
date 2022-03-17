import { expect } from "chai";

export default (): void => {
  it("MARKETPLACE_OFFER: NFT was created", async function (): Promise<void> {
    await this.instanceERC721.changeMinterRole(this.instance.address);
    await this.instance.createItem(this.testCID);

    const balance = await this.instanceERC721.balanceOf(this.owner.address);

    expect(balance).to.eq(1);
  });
  it("MARKETPLACE_OFFER: ListItem and getOffer work correctly", async function (): Promise<void> {
    await this.instanceERC721.changeMinterRole(this.instance.address);
    await this.instance.createItem(this.testCID);
    await this.instanceERC721.approve(this.instance.address, 1);
    await this.instance.listItem(1, this.basePrice);

    const [owner, status, price, tokenId] = await this.instance.getOffer(1);
    const resultData = [owner, status, String(price), +tokenId];
    const expectData = [this.owner.address, 1, this.basePrice, 1];

    expect(JSON.stringify(expectData)).to.eq(JSON.stringify(resultData));
  });
  it("MARKETPLACE_OFFER: Only the owner can create an offer", async function (): Promise<void> {
    await this.instanceERC721.changeMinterRole(this.instance.address);
    await this.instance.createItem(this.testCID);
    await this.instanceERC721.approve(this.instance.address, 1);
    await expect(
      this.instance.connect(this.addr1).listItem(1, this.basePrice)
    ).to.be.revertedWith("Only the owner can do this.");
  });
  it("MARKETPLACE_OFFER: BuyItem works correctly", async function (): Promise<void> {
    await this.instanceERC721.changeMinterRole(this.instance.address);
    await this.instance.createItem(this.testCID);
    await this.instanceERC721.approve(this.instance.address, 1);
    await this.instance.listItem(1, this.basePrice);

    const buy = await this.instance
      .connect(this.addr1)
      .buyItem(1, { value: this.basePrice });

    await buy.wait();

    await expect(() => buy).to.changeEtherBalances(
      [this.addr1, this.owner],
      [-this.basePrice, this.basePrice]
    );

    const [_, status] = await this.instance.getOffer(1);
    const balance = await this.instanceERC721.balanceOf(this.addr1.address);

    expect(balance).to.eq(1);
    expect(status).to.eq(2);
  });
  it("MARKETPLACE_OFFER: Lot must be in progress", async function (): Promise<void> {
    await expect(
      this.instance.connect(this.addr1).buyItem(1)
    ).to.be.revertedWith("Lot must be in progress.");
  });
  it("MARKETPLACE_OFFER: Incorrect amount", async function (): Promise<void> {
    await this.instanceERC721.changeMinterRole(this.instance.address);
    await this.instance.createItem(this.testCID);
    await this.instanceERC721.approve(this.instance.address, 1);
    await this.instance.listItem(1, this.basePrice);

    await expect(
      this.instance.connect(this.addr1).buyItem(1, { value: this.lowPrice })
    ).to.be.revertedWith("Incorrect amount.");
  });
  it("MARKETPLACE_OFFER: Сancel works correctly", async function (): Promise<void> {
    await this.instanceERC721.changeMinterRole(this.instance.address);
    await this.instance.createItem(this.testCID);
    await this.instanceERC721.approve(this.instance.address, 1);
    await this.instance.listItem(1, this.basePrice);
    await this.instance.cancel(1);

    const [_, status] = await this.instance.getOffer(1);
    const balance = await this.instanceERC721.balanceOf(this.owner.address);

    expect(status).to.eq(3);
    expect(balance).to.eq(1);
  });
  it("MARKETPLACE_OFFER: Lot must be in progress", async function (): Promise<void> {
    await expect(this.instance.cancel(1)).to.be.revertedWith(
      "Lot must be in progress."
    );
  });
  it("MARKETPLACE_OFFER: Lot must be in progress", async function (): Promise<void> {
    await this.instanceERC721.changeMinterRole(this.instance.address);
    await this.instance.createItem(this.testCID);
    await this.instanceERC721.approve(this.instance.address, 1);
    await this.instance.listItem(1, this.basePrice);

    await expect(
      this.instance.connect(this.addr1).cancel(1)
    ).to.be.revertedWith("Only the owner can do this.");
  });
};
