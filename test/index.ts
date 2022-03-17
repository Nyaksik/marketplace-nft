import { artifacts, ethers, waffle } from "hardhat";
import { Artifact } from "hardhat/types";
import mint from "./TokenERC721/mint";
import viewFunctions from "./TokenERC721/viewFunctions";

describe("Contract testing", async function () {
  before(async function () {
    this.baseURL = "https://ipfs.io/ipfs/";
    this.testCID = "QmUzhF6ZLHC65FwDStyCjYyo5cLPpvRfd2gFZa4ptLGeQt";
    this.zeroAddress = "0x0000000000000000000000000000000000000000";
    [this.owner, this.addr1] = await ethers.getSigners();
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
  viewFunctions();
  mint();
});
