import { artifacts, ethers, waffle } from "hardhat";
import { Artifact } from "hardhat/types";
import auction from "./Marketplace/auction";
import offer from "./Marketplace/offer";
import viewFunctionsMarketplace from "./Marketplace/viewFunctions";
import mint from "./TokenERC721/mint";
import viewFunctionsERC721 from "./TokenERC721/viewFunctions";

describe("Contract testing", async function () {
  before(async function () {
    this.baseURL = "https://ipfs.io/ipfs/";
    this.testCID = "QmUzhF6ZLHC65FwDStyCjYyo5cLPpvRfd2gFZa4ptLGeQt";
    this.bigPrice = String(1e7);
    this.basePrice = String(1e6);
    this.lowPrice = String(1e3);
    this.zeroAddress = "0x0000000000000000000000000000000000000000";
    [this.owner, this.addr1, this.addr2, this.addr3] =
      await ethers.getSigners();
  });
  beforeEach(async function () {
    const artifactTokenForMarket: Artifact = await artifacts.readArtifact(
      "TokenForMarket"
    );
    const deployPayloadERC721 = [this.owner.address];
    this.instanceERC721 = await waffle.deployContract(
      this.owner,
      artifactTokenForMarket,
      deployPayloadERC721
    );
    const artifactMarketpace: Artifact = await artifacts.readArtifact(
      "Marketplace"
    );
    const deployPayloadMarketplace = [this.instanceERC721.address];
    this.instance = await waffle.deployContract(
      this.owner,
      artifactMarketpace,
      deployPayloadMarketplace
    );
  });
  viewFunctionsERC721();
  mint();
  viewFunctionsMarketplace();
  offer();
  auction();
});
