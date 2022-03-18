import { ethers } from "hardhat";

async function main() {
  const Marketplace = await ethers.getContractFactory("Marketplace");
  const marketplace = await Marketplace.deploy(
    process.env.TOKEN_ADDRESS as string
  );

  await marketplace.deployed();

  console.log(`Marketplace deployed to: ${marketplace.address}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
