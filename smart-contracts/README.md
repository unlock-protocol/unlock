# Smart Contracts

**This folder contains versions of Unlock protocol contracts that are currently UNDER DEVELOPMENT. For applications, please refer to the code in [@unlock-protocol/contracts](../packages/contracts) or directly use the npm package [`@unlock-protocol/contracts`](https://npmjs.com/package/@unlock-protocol/contracts)**

---

See [our docs](https://docs.unlock-protocol.com/developers/smart-contracts-architecture) for an overview of the smart contracts and [the smart-contract-extensions repo](https://github.com/unlock-protocol/unlock/tree/master/smart-contract-extensions) for integration examples. The deployment process itself is [on our wiki](https://github.com/unlock-protocol/unlock/wiki/Releasing-a-new-version-of-the-contracts).

## Run locally

Start hardhat node.

```
yarn install
yarn run hardhat node
```

Then you can deploy the contracts locally

```
yarn run hardhat deploy
```

### Run the tests

```
npx hardhat test
```

To see all emitted events

```
npx hardhat test --logs
```

### Run a fork (mainnet, polygon, etc)

To test on a [network fork](https://hardhat.org/guides/mainnet-forking.html#forking-from-mainnet), you need to export `RUN_FORK=xxx` to your env, where `xxx` is the chain id of the network.

ex .

```
export RUN_FORK=1

npx hardhat node
// Running a mainnet fork...

export RUN_FORK=100 # xdai
export RUN_FORK=5 # rinkeby
...
```

Once you have mainnet running locally, you can run the relevant tests in another terminal:

```
export RUN_FORK=1
yarn hardhat --network localhost test test/UnlockDiscountToken/upgrades.mainnet.js
```

Note that if the var `RUN_FORK` is not set, the tests named with the suffix `.mainnet.js` are skipped and will be marked as pending on the CI.

### Setup networks

To set up a network for deployment, change `networks.js` to add your networks and/or change the provider used (defaults might be slower/rate limited).

### Setup account

We use the `DEPLOYER_PRIVATE_KEY` environment variable to interact with contracts. Please set it.

### Run the UDT contract upgrade

Once your network are setup, you can run the UDT contract upgrade

```
npx hardhat run scripts/udt-upgrade.js --network goerli
```

## Upgrade a contract

### Prepare and test the new contract on a mainnet node

```
# setup credentials
export RUN_FORK=1

# run the tests
yarn test test/mainnet/udt.js
```

### Unlock

```
$ npx hardhat upgrade --contract contracts/Unlock.sol --network localhost
Deploying new implemntation on mainnet...
Unlock V9 implementation deployed at: <contract-address>

#  verify the implementation contract
ETHERSCAN_API_KEY=<your-api-key> yarn verify <contract-address>
```

### Get implementation address

```
npx hardhat impl --contract contracts/<YourContract.sol>
> implementation address: <address>
```

NB: for Polygon, you need an API key from https://polygonscan.com

### Update PublicLock template

#### Check changes in storage layout

```
yarn hardhat run scripts/lock/testUpgrade.js
```

Note: you need to update the `LATEST_PUBLIC_LOCK_VERSION` in the script.

This script is use to check the changes in storage layout between two upgrades
using the openzeppellin plugin. It will deploy first the version `LATEST_PUBLIC_LOCK_VERSION`
then deploy the version in `contracts/PublicLock.sol`. The errors thrown by the upgrades plugin
should allow to detect changes in storage layout.

#### Test the PublicLock template on mainnet fork

Make a dry run of the upgrade on a mainnet fork by

- deploy the specified PublicLock tempalte
- parse the calldata for `addLockTemplate`
- send the calldata tx to the multisig
- impersonate all signers to run the tx

```shell
# to deploy a version already in the contracts package
RUN_FORK=1 yarn hardhat submit:version --public-lock-version 12

# to deploy a version from the local ./contracts folder
RUN_FORK=1 yarn hardhat submit:version
```

#### Update the PublicLock template

Export all block explorers api keys into the terminal

```
cp .env.copy .env
source .env
```

Deploy a template

```
# deploy and submit tx to the multisig
yarn hardhat submit:version --public-lock-version 12

# to just submit an exsiting version to the mulisig
yarn hardhat submit:version --public-lock-address 0x....
```

Deploy on all networks at once

```
sh scripts/all_networks.sh submit:version --public-lock-version 12
```

#### Deploy a PublicLock upgrade (step by step)

```
# deploy a new template
yarn hardhat deploy:template

# verify the contract
ETHERSCAN_API_KEY=<your api key> yarn verify <template-address>

# Set the template
yarn hardhat set:template --unlock-address <xxx> --public-lock-address <template-address>
```

## Deploy the contracts

### Deploy all

You can setup an entire environment using

```
yarn deploy-all
```

Or deploy different part separately

```
# some sample commands
yarn hardhat deploy:unlock
yarn hardhat deploy:udt
yarn hardhat deploy:weth
yarn hardhat deploy:uniswap --weth-address 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
yarn hardhat deploy:oracle --uniswap-factory-address 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0

# config tasks are also available
yarn hardhat set:unlock-oracle --oracle-address <xxx> \
  --unlock-address <xxx> \
  --udt-address <xxx>
```

see `npx hardhat --help` for a list of all available tasks and deployments

#### Deploy previous versions

```
yarn hardhat deploy:unlock --unlock-version 8
```

### Update Unlock config

```
yarn hardhat set:unlock-config --unlock-address <xxx> \
  --udt-address <xxx>
  --weth-address <xxx>
  --estimated-gas-for-purchase <xxx>
  --locksmith-u-r-i <xxx>
```

## Governor + Timelock

```
yarn hardhat deploy:governor

Deploying Governor on localhost with the account: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266...
> Timelock w proxy deployed at: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
> Governor deployed (w proxy) at: 0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9
> Governor added to Timelock as sole proposer.  0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9 is Proposer: true
> Unlock Owner recounced Admin Role.  0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 isAdmin: false
```

### Make a DAO proposal

1. First, create a file in the `proposals` folder that describe the proposal itself. The file should contain either a js async function or a literal object and should export as default an object containing: 1. the title of the proposal and 2. an array with the description of the calls to send - in following format:

#### Exports a litteral object

```js
module.exports = {
  proposalName: `My Proposal`, // a string describing the proposal
  calls: [
    {
      contractName, // the contract name or an ABI - ex. `UnlockDiscountTokenV3`
      functionName, // the name or signature of the function to be executed - `transfer`
      functionArgs, // the args of the function - ex. [ 0x0000..., 10000 ]
      value, // (optional) payable value in native tokens
    },
  ],
}
```

check [`./proposals/000-example.js`](./proposals/000-example.js) for an example.

#### Exports an aysnc function

When using an async function to parse a proposal, you can pass params to the function through positional args in cli scripts.

**CLI call**

```sh
RUN_FORK=1 yarn hardhat gov --gov-address 0x7757f7f21F5Fa9b1fd168642B79416051cd0BB94 \
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
        contractName, // the contract name or an ABI - ex. `UnlockDiscountTokenV3`
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
RUN_FORK=1 yarn hardhat gov --gov-address 0x7757f7f21F5Fa9b1fd168642B79416051cd0BB94 \
  --proposal proposals/<your-proposal>.js
```

Additionnaly, you can pass arguments to your proposal script via CLI positional args.

3. When things are ready, post it to the DAO!

```

yarn hardhat gov:submit --proposal proposals/<your-proposal>.js --network mainnet

```

4. Head to [Tally](https://www.withtally.com/governance/unlock) to see your proposal. NB: this may take some time as it requires X block confirmations

## Release a new version of a contract

1. Update the version number in the contract
2. Fix relevant tests
3. Create a PR mentioning the version bump
4. Make you changes
5. Release the new versions of the contracts ABI with the following command

```

yarn workspace @unlock-protocol/smart-contracts hardhat release --contract contracts/<Unlock|PublicLock>.sol

```

## Handle locks

### Deploy sample locks

Once you have deployed the Unlock contract on localhost, you can try

```

yarn hardhat lock:samples --unlock-address 0x720472c8ce72c2A2D711333e064ABD3E6BbEAdd3 --network localhost

```

### Serialize existing lock

```

# deploy LockSerializer contract

yarn deploy:serializer --network localhost

# copy data of a lock locally

yarn hardhat lock:serialize --lock-address 0x... --deployer-address 0x... -- --network localhost

```

## Clone an existing locks

```

# copy data of a lock locally

yarn hardhat lock:clone --lock-address 0x... --deployer-address 0x... -- --network localhost

```

## Handle locks

### Deploy sample locks

Once you have deployed the Unlock contract on localhost, you can try

```

yarn hardhat lock:samples --unlock-address 0x720472c8ce72c2A2D711333e064ABD3E6BbEAdd3 --network localhost

```

### Serialize existing lock

```

# deploy LockSerializer contract

yarn deploy:serializer --network localhost

# copy data of a lock locally

yarn hardhat lock:serialize --lock-address 0x... --deployer-address 0x... -- --network localhost

```

## Clone an existing locks

```

yarn hardhat lock:clone --lock-address 0x84Ee59446F664c933b175fBB96c489ac2Ed76d31 /
--serializer-address 0xf090f16dEc8b6D24082Edd25B1C8D26f2bC86128 /
--unlock-address 0x071586BA1b380B00B793Cc336fe01106B0BFbE6D /
--network localhost

```

## List lock managers

```

yarn hardhat lock:managers --lock-address 0x06441a9ac376b80004c32f8f37b1f80a2135362c --network xdai
LOCK > managers for the lock 'lido':
[0]: 0x61e155fac2bb8e58fa8c5c01a21e0513cfe52fc4

```

## Verify contracts

Contracts can be verified contracts on Xdai, Polygon and BSC using the command line.

```

# xdai

export BLOCKSCOUT_API_KEY=<xxx>
yarn hardhat verify <address> --network xdai

# polygon

export POLYGONSCAN_API_KEY=<xxx>
yarn hardhat verify <address> --network polygon

# bsc

export BSCSCAN_API_KEY=<xxx>
yarn hardhat verify <address> --network binance

```

## How to deploy the Protocol on a new network

### Add network to `@unlock-protocol/networks`

- add `goerli.ts` to `packages/networks/src`
- add `export * from './goerli'` to `packages/networks/src/index.ts`

### Deploy contracts

```

yarn hardhat deploy --public-lock-version 10 --network goerli

Starting deployments on Goerli (Testnet)...
UNLOCK DEPLOYMENT > Deploying contracts on Goerli (Testnet) with the account: 0x81a662065d5c83Fa9c5C12d0dc0104dF57f85A12
UNLOCK DEPLOYMENT > isLocalNet : false
UNLOCK SETUP > Unlock (w proxy) deployed to: 0x1FF7e338d5E582138C46044dc238543Ce555C963 (tx: 0x01f01178b5dffe20d700e71c9dd89bdc7e69ab93808334f4a68846471fc2633b)
PUBLIC LOCK > deployed v10 to : 0x5Ad19758103D474bdF5E8764D97cB02b83c3c844 (tx: 0xd02145635e7a865d4ad4fe7b22f1ba66b4aa45597d74a5bed376e7fd70c90dc5)

```

### Verify contracts

You need to verify the deployed contracts : Unlock , PublicLock and the Proxy used to create locks
NB: you can get `yarn hardhat impl --proxy-address <UNLOCK_ADDRESS> --network goerli`

```

export ETHERSCAN_API_KEY=<xxx>

# verify unlock

yarn hardhat verify <UNLOCK_IMPLEMENTATION_ADDRESS> --network goerli

# verify public-lock (while specifying a version)

yarn hardhat verify-template --public-lock-address <UNLOCK_IMPLEMENTATION_ADDRESS> \
 --public-lock-version 10 \
 --network goerli

# verify proxy

yarn hardhat verify-proxy --public-lock-address <UNLOCK_IMPLEMENTATION_ADDRESS> \
 --proxy-admin-address 0xa87b313b7b918f74b2225759e7b05c243adec271 \ # this is from `unlock.proxyAdminAddress`
--network goerli

```

### Set template

```

yarn hardhat set:template --unlock-address 0x1FF7e338d5E582138C46044dc238543Ce555C963 \
 --public-lock-address 0x5Ad19758103D474bdF5E8764D97cB02b83c3c844 \
 --network avalanche

```

### Config Unlock

Run `configUnlock` on the Unlock contract with the following params

```

udt :0x0000000000000000000000000000000000000000
weth: <Wrapped base currency (eth on mainnet... etc) address on network>
estimatedGasForPurchase: 200000
symbol: KEY
URI: https://locksmith.unlock-protocol.com/api/key/<chainId>
chainId: <chainId>

```

### Create a Safe and transfer Unlock ownership there

1. Run this command to create a safe with the same owners as the mainnet wallet

```

yarn hardhat safe:create --network goerli

```

1. Go to https://safe.global/app/load and follow the steps to add the new wallet.

2. Transfer the ownership of the Unlock instance to the multisig

```

yarn hardhat safe:transfer --safe-address <SAFE_GLOBAL_ADDRESS> \
 --contract-address <UNLOCK_ADDRESS>
--network goerli

```

### Update the `networks` package

Add info about unlock and multisig to the network file

- edit `packages/networks/src/goerli.ts`
- add the unlock address to `unlockAddress`
- add the multisig safe address to `multisig`
- add the block number before Unlock contract creation as `startBlock`
- rebuild the package with `yarn build`

### Deploy a subgraph

1. Prepare `subgraph.yaml` and related deployment files

```shell
# got to the subgraph folder
cd subgraph

# create the subgraph.yaml
yarn generate-subgraph-yaml --network goerli

# generate .ts contract and template
yarn codegen

# build as JSON/wasm
yarn build --network goerli
```

2. create a new graph on [The Graph hosted service](https://thegraph.com/hosted-service/subgraph/create?account=unlock-protocol) with the name of the network (here _goerli_)

3. deploy the graph

```
yarn deploy --access-token <THEGRAPH_ACCESS_TOKEN>  --environment production --network goerli
```

4. Wait for the graph index to sync

The graph will crawl all blocks from the `startBlock` set in the `@unlock-protocol/networks` network file up to the latest block height in the network. The process takes several hours.
