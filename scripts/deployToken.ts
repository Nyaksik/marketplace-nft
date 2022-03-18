import { ethers } from "hardhat";

async function main() {
  const Token = await ethers.getContractFactory("TokenForMarket");
  const token = await Token.deploy(
    process.env.WALLET as string
  );

  token.deployed();

  console.log(`Token deployed to: ${token.address}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
