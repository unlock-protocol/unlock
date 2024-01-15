# Unlock Protocol Governance

This folders contains all the tools to manage the Unlock Protocol (DAO, contracts, etc).

## Verify contracts

Contracts can be verified on all supported networks using the command line.

```
# example
export POLYGONSCAN_API_KEY=<xxx>
yarn hardhat verify <address> --network polygon
```

### Verify locks proxy

There is a dedicated script to verify the proxy used by Unlock to create locks

```
yarn hardhat verify-proxy <...>
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
