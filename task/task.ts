import { task } from "hardhat/config";

task("changeMinter", "Changes the minter")
  .addParam("address", "Address of the new minter")
  .setAction(async ({ address }: { address: string }, { ethers }) => {
    const [signer] = await ethers.getSigners();
    const instance = await ethers.getContractAt(
      "TokenForMarket",
      process.env.TOKEN_ADDRESS as string,
      signer
    );

    await instance.changeMinterRole(address);

    console.log(`Minter changed to address: ${address}`);
  });

task("createItem", "Create an NFT")
  .addParam("uri", "TokenURI")
  .setAction(async ({ uri }: { uri: string }, { ethers }) => {
    const [signer] = await ethers.getSigners();
    const instance = await ethers.getContractAt(
      "Marketplace",
      process.env.TOKEN_ADDRESS as string,
      signer
    );

    await instance.createItem(uri);

    console.log(`Token with ${uri} has been created`);
  });
