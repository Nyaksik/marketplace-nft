import { expect } from "chai";

export default (): void => {
  it("ERC721_MINT: Initial balance is zero", async function (): Promise<void> {
    const balance = await this.instanceERC721.balanceOf(this.owner.address);

    expect(balance).to.eq(0);
  });
  it("ERC721_MINT: Balance after mint is equal to one", async function (): Promise<void> {
    await this.instanceERC721.mint(this.owner.address, this.testCID);

    const balance = await this.instanceERC721.balanceOf(this.owner.address);

    expect(balance).to.eq(1);
  });
  it("ERC721_MINT: Only minter can mint tokens.", async function (): Promise<void> {
    await expect(
      this.instanceERC721
        .connect(this.addr1)
        .mint(this.owner.address, this.testCID)
    ).to.be.revertedWith("Only minter can do this.");
  });
  it("ERC721_MINT: After calling changeMinterRole, the address of the minter will change", async function (): Promise<void> {
    await this.instanceERC721.changeMinterRole(this.addr1.address);

    const minter = await this.instanceERC721.minter();

    expect(minter).to.eq(this.addr1.address);
  });
  it("ERC721_MINT: Only the owner can change the minter.", async function (): Promise<void> {
    await expect(
      this.instanceERC721
        .connect(this.addr1)
        .changeMinterRole(this.addr1.address)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });
};
