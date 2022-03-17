import { expect } from "chai";

export default (): void => {
  it("ERC721_VIEW: Name is 'TokenForMarket'", async function (): Promise<void> {
    const name = await this.instanceERC721.name();

    expect(name).to.eq("TokenForMarket");
  });
  it("ERC721_VIEW: Symbol is 'TFM'", async function (): Promise<void> {
    const symbol = await this.instanceERC721.symbol();

    expect(symbol).to.eq("TFM");
  });
  it("ERC721_VIEW: Minter is marketplace address", async function (): Promise<void> {
    const minter = await this.instanceERC721.minter();

    expect(minter).to.eq(this.owner.address);
  });
  it("ERC721_VIEW: BASE_URI is equal to 'https://ipfs.io/ipfs/'", async function (): Promise<void> {
    const minter = await this.instanceERC721.getBaseURI();

    expect(minter).to.eq(this.baseURL);
  });
};
