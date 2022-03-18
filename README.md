# Marketplace contact project

# Link

- __[Link to the marketplace contract](https://rinkeby.etherscan.io/address/0x8fA8451B5cec61FE8057e6A19C18c0eb2616e15A)__ (Rinkeby test network)
- __[Link to the NFT contract](https://rinkeby.etherscan.io/address/0x9d263ca1fe42dDECe277693B80746A0de4BC2CaB)__ (Rinkeby test network)


# Basic tasks for interacting with a contract

## Use it to compile the contract

```TypeScript
npx hardhat clean && npx hardhat compile
// or
npm run compile
```

## Use it to deploy the contract locally

- __Deploy marketplace contract__

```TypeScript
npx hardhat run scripts/deploy.ts --network localhost
// or
npm run local
```

- __Deploy NFT__

```TypeScript
npx hardhat run scripts/deployToken.ts --network localhost
```

## Use it to deploy the contract in the rinkeby test network

- __Deploy marketplace contract__

```TypeScript
npx hardhat run scripts/deploy.ts --network rinkeby
// or
npm run rinkeby
```

- __Deploy NFT__

```TypeScript
npx hardhat run scripts/deployToken.ts --network rinkeby
```

## Use it to test

```TypeScript
npx hardhat test
// or
npm run test
```

## Use it to view the test coverage

```TypeScript
npx hardhat coverage
// or
npm run coverage
```

## Use it to view global options and available tasks

```TypeScript
npx hardhat help
// or
npm run help
```

# Etherscan verification

To try out Etherscan verification, you first need to deploy a contract to an Ethereum network that's supported by Etherscan, such as Rinkeby.

In this project, copy the .env.example file to a file named .env, and then edit it to fill in the details. Enter your Etherscan API key, your Rinkeby node URL (eg from Infura), and the private key of the account which will send the deployment transaction. With a valid .env file in place, first deploy your contract:

```TypeScript
npx hardhat run scripts/deploy.ts --network rinkeby
// or
npm run rinkeby
```

Then, copy the deployment address and paste it in to replace `DEPLOYED_CONTRACT_ADDRESS` in this command:

```TypeScript
npx hardhat verify --network rinkeby DEPLOYED_CONTRACT_ADDRESS
```

# Performance optimizations

For faster runs of your tests and scripts, consider skipping ts-node's type checking by setting the environment variable `TS_NODE_TRANSPILE_ONLY` to `1` in hardhat's environment. For more details see [the documentation](https://hardhat.org/guides/typescript.html#performance-optimizations).
