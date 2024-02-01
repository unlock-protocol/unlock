# Unlock Protocol Governance

This folders contains all the tools to manage the Unlock Protocol (contracts, DAO, etc).

To get the list of all available tasks use `yarn hardhat --help`.

## Deploy Unlock Protocol on a new network

### List network in `@unlock-protocol/networks`

First add your network to the list of supported networks:

- create a `<your-network>.ts` file to `packages/networks/src`
- add `export * from './<your-network>'` to `packages/networks/src/index.ts`

Then you will need to edit the values for chain id, block explorer URLs, etc.

When you are done, rebuild the networks package with

```
yarn workspace @unlock-protocol/networks build
```

## Add block explorer verification

- add a `<your-network>` key to the `apiKey` object in [`packages/hardhat-helpers/etherscan.js`](/packages/hardhat-helpers/src/etherscan.js)
- optionally can add support for env variable

When you are done, rebuild the helpers package with

```
yarn workspace @unlock-protocol/hardhat-helpers build
```

### Deploy contracts

Now you need to deploy and configure the two main contracts

- The factory contract `Unlock`
- The template contract `PublicLock`

This can be done with the following command:

```
yarn hardhat deploy --unlock-version 13 --public-lock-version 14 --network <your-network>
```

You can resume a pre-existing deployment by using the contract addresses instead of version number with the `--unlock-address` or `--public-lock-address`.

#### Update the `networks` package

Once the deployments are done, you need to add to the `packages/networks/src/<your-network>.ts` package

- `unlockAddress`: the address of the deployed Unlock contract
- `startBlock`: the block number to start indexing data (usually right before Unlock contract creation)

### Configure the contracts

The contracts should have been configured correctly during the deployment step. However you do the configuration manually

#### Set a lock template in Unlock

```
yarn hardhat set:template
```

#### Configure Unlock

Run `configUnlock` on the Unlock contract with the following params

```
yarn hardhat set:unlock-config
```

### Deploy the subgraph

First you will need to create a new graph on [The Graph](https://thegraph.com) studio.

Then the following commands

```shell
# got to the subgraph folder
cd subgraph

# create the subgraph.yaml and generate the files
yarn build <your-network>

yarn deploy:studio <your-subgraph-name>
```

The graph will now sync. In the `packages/networks/src/<your-network>.ts` config file, fill the `subgraph` object with a name in `studioEndpoint` and the API url in `endpoint`.

### Verify contracts

Contracts can be verified on all supported networks using the command line.

```
# example
yarn hardhat verify <address> --network <your-network>
```

### Verify locks proxy

There is a dedicated script to verify the proxy used by the Unlock factory contract to create locks. You need to pass the hash of the tx creation as a param to the following function.

```
yarn hardhat verify-proxy
```

## Use a tenderly fork

Forks on [Tenderly](https://docs.tenderly.co/forks) can be very useful to test behaviours of new settings and contracts before actually deploying them. A fork of a network allows to simulate the execution of multiple successive txs - which is very useful while working on a batch of changes.

```
export TENDERLY_FORK=https://rpc.tenderly.co/fork/xxx-xxx-xxx-xx

# then use any command with tenderly as a network
yarn hardhat deploy:template --network tenderly
```

## DAO Proposals

### Make a DAO proposal

1. First, create a file in the `proposals` folder that describe the proposal itself. The file should contain either a js async function or a literal object and should export as default an object containing: 1. the title of the proposal and 2. an array with the description of the calls to send - in following format:

#### Exports a literal object

```js
module.exports = {
  proposalName: `My Proposal`, // a string describing the proposal
  calls: [
    {
      contractNameOrAbi, // the contract name or an ABI - ex. `UnlockDiscountTokenV3`
      functionName, // the name or signature of the function to be executed - `transfer`
      functionArgs, // the args of the function - ex. [ 0x0000..., 10000 ]
      value, // (optional) payable value in native tokens
    },
  ],
}
```

check [`./proposals/000-example.js`](./proposals/000-example.js) for an example.

#### Exports an async function

When using an async function to parse a proposal, you can pass params to the function through positional args in cli scripts.

**CLI call**

```sh
RUN_FORK=1 yarn hardhat gov --gov-address 0x440d9D4E66d39bb28FB58729Cb4D3ead2A595591 \
  --proposal proposals/my-proposal.js
  0x000000 1000
```

**JS async proposal**

```js
import { ethers } from 'hardhat'

module.exports = async function (params) {
  // unpack params from the command line i.e. [0x00000, 1000]
  const [myAddress, myAmount] = params

  // do whatever you need with await calls and your params...
  const contract = await ethers.getContractAt('MyContract', myAddress)
  const amount = await contract.someFunc(myAmount)

  // the returned format
  return {
    proposalName: `My async proposal`, // a string describing the proposal
    calls: [
      {
        contractNameOrAbi, // the contract name or an ABI - ex. `UnlockDiscountTokenV3`
        functionName, // the name or signature of the function to be executed - `transfer`
        functionArgs: [amount], // the args of the function - ex. [ 0x0000..., 10000 ]
        value, // (optional) payable value in native tokens
      },
    ],
  }
}
```

check [`./proposals/002-set-protocol-fee.js`](./proposals/002-set-protocol-fee.js) for an example.

2. Test you proposal locally on a mainnet fork

```shell
RUN_FORK=1 yarn hardhat gov --gov-address 0x440d9D4E66d39bb28FB58729Cb4D3ead2A595591 \
  --proposal proposals/<your-proposal>.js
```

Additionnaly, you can pass arguments to your proposal script via CLI positional args.

3. When things are ready, post it to the DAO!

```
yarn hardhat gov:submit --proposal proposals/<your-proposal>.js --network mainnet
```

4. Head to [Tally](https://www.withtally.com/governance/unlock) to see your proposal. NB: this may take some time as it requires X block confirmations

## Uniswap

### Create a Uniswap V3 Native/UDT pool

Edit the pool fee directly in the script

```
yarn run scripts/uniswap/createPool.js
```

### Add liquidity a Uniswap V3 Native/UDT pool

Edit directly the amounts and prices in the script

```
yarn run scripts/uniswap/addLiquidity.js
```
