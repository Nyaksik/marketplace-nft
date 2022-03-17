import { expect } from "chai";

export default (): void => {
  it("MARKETPLACE_VIEW: Auction duration is 3 days", async function (): Promise<void> {
    const duration = await this.instance.AUCTION_DURATION();

    expect(duration).to.eq(259200);
  });
  it("MARKETPLACE_VIEW: Minimum number of bets is 2", async function (): Promise<void> {
    const minBets = await this.instance.MINIMUM_NUMBER_OF_BETS();

    expect(minBets).to.eq(2);
  });
  it("MARKETPLACE_VIEW: Address of the tokenERTS721 is set correctly", async function (): Promise<void> {
    const address = await this.instance.getNFTContractAddress();

    expect(address).to.eq(this.instanceERC721.address);
  });
};
