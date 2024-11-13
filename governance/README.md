# Unlock Protocol Governance

This folder contains all the tools to manage the Unlock Protocol (contracts, DAO, etc).

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

- add a `<your-network>` key to the `apiKey` object in [`packages/hardhat-helpers/src/etherscan.js`](/packages/hardhat-helpers/src/etherscan.js)
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

1. First you will need to create a new graph on [The Graph studio](https://thegraph.com/studio).

2. In the `packages/networks/src/<your-network>.ts` config file, fill the `subgraph` object as follow:

```js
subgraph: {
    endpoint: '<>', // this is given to you by the graph after deploying
    networkName: 'base-sepolia', // the graph name of the network see https://thegraph.com/docs/en/developing/supported-networks/
    studioName: 'unlock-protocol-<your-network>', // the name of the graph
  },
```

3. Rebuild the networks package

```
yarn workspace @unlock-protocol/networks build
```

4. Deploy the graph by using the following commands

```shell
# got to the subgraph folder
cd subgraph

# create the subgraph.yaml and generate the files
yarn build <your-network>

yarn deploy <your-subgraph-name>
```

The graph is now deployed. Add the URL that is shown to the network file.

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

1. First, create a file in the `proposals` folder that describes the proposal itself. The file should contain either a js async function or a literal object and should export as default an object containing: 1. the title of the proposal and 2. an array with the description of the calls to send - in following format:

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
RUN_FORK=8453 yarn hardhat gov --gov-address 0x65bA0624403Fc5Ca2b20479e9F626eD4D78E0aD9 \
  --proposal proposals/up/my-proposal.js
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

2. Test your proposal locally on a base fork

```shell
RUN_FORK=8453 yarn hardhat gov --gov-address 0x65bA0624403Fc5Ca2b20479e9F626eD4D78E0aD9 \
  --proposal proposals/up/<your-proposal>.js
```

Additionally, you can pass arguments to your proposal script via CLI positional args.

3. When things are ready, post it to the DAO!

```
yarn hardhat gov:submit --proposal proposals/<your-proposal>.js --network base
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

## Cross-Chain DAO Proposals

To maintain the integrity of the protocol across various chains, we use a pattern of DAO proposals that allows execution on multiple chains. Messaging is sent across the [Connext bridge](https://connext.network) to all supported chains.

### Prepare a cross-chain proposal

#### Write a cross-chain DAO proposal

Read the explanations and follow the template in [`./proposals/006-cross-bridge-proposal.js`](./proposals/006-cross-bridge-proposal.js) to submit a cross-chain proposal to the DAO.

#### Test a cross-chain DAO proposal

To make sure all calls can be executed properly, you can use Tenderly forks to test execution of calls on each destination chains.

There is test DAO deployed with the entire cross-chain pipeline configured between Gnosis chain and Polygon mainnet - available at [0x530ff2daed410ca7d70c25f18dc770f106201151](https://www.tally.xyz/gov/unlock-cross-chain-test-dao-on-gnosis/proposals). The address of the multisig on destination (Polygon) is [0x6ff837695B120A8f533498584249131F1c6fC4a8](https://app.safe.global/transactions/history?safe=matic:0x6ff837695B120A8f533498584249131F1c6fC4a8)

A test version of the Unlock factory contract is deployed on Polygon at [0x2411336105D4451713d23B5156038A48569EcE3a](https://polygonscan.com/address/0x2411336105d4451713d23b5156038a48569ece3a) and can be used for testing cross-chain proposals execution.

### Execute a cross-chain DAO proposal

Once the proposal has been through the timelock embargo period and has been executed on the DAO, there are still a few steps for all calls to cross the bridges and get executed properly on all destination chains. These steps can be executed by anyone.

1. pay the Connext bridge fee for all the calls
2. wait for the calls to cross the bridge (usually ~2-5h)
3. wait for the safe (multisig) cooldown period (2 days)
4. execute the calls on each chain

#### Get the execution tx id

To execute these commands, you will need the hash from the transaction that executed the proposal on the DAO. The transaction contains the IDs of the bridge calls that will be used by the scripts to fetch information.

NB: On [Tally.xyz](://www.tally.xyz/gov/unlock), an etherscan link containing the hash can be found on the upper left button next to _Proposal Executed_.

```
export PROPOSAL_EXECUTION_TX=<0x....>
```

#### Pay bridge fees

Calls for each chains are sent from the proposal separately to the bridge of the destination chain. A bridge fee needs to be paid on origin chain for the txs to proceed and cross to the other side.

Instead of having to pay each fee separately, we batch all fee payments in a single multicall executed by a Safe. To create the batched call in a multisig, you can use the script below. Then you need to go the multisig and execute it.

```
# set the execution tx id
export PROPOSAL_EXECUTION_TX=<0x....>

# create a batched multisig tx to pay the bridge fees
yarn hardhat run scripts/bridge/payFee.js --network mainnet
```

#### Check status of the calls

You can check the status of all calls on various chains manually with the [Connext explorer](https://connextscan.io/) or directly parse calls from the execution tx using the script below. You will need [an API key from The Graph](https://thegraph.com/studio/apikeys/) to query the Connext bridge subgraph and get the status of all transactions.

```
# set the execution tx id
export PROPOSAL_EXECUTION_TX=<0x....>

# export the subgraph api key
export SUBGRAPH_QUERY_API_KEY=<...>

# check the status of the calls on all bridges
yarn hardhat run scripts/bridge/status.js --network mainnet
```

NB: This will create a temporary JSON file named `xcalled.tmp.json` with the info and statuses of all tx.

### Execute all tx on destination chains

Once all calls have crossed the bridges they stay in cooldown in multisigs. Once cooldown ends, they can be executed. To execute the calls, use the following command _for each network_:

```
yarn hardhat run scripts/bridge/execTx.js --network optimism
```

NB: The tmp file with all txs statuses is required, so you need to first run the "Check status" step above

### Add a new network to the cross-chain governance

As the Connext bridge supports more networks, they need to be added to the cross chain gov process (see [supported networks](https://docs.connext.network/resources/deployments) on Connext docs).

The process is as follow:

- [ ] deploy the delayMod and connextMod for the Safe multisig by running `yarn hardhat run scripts/multisig/deployMods.js --network <network_name>`
- [ ] add both modules addresses to the `dao.governanceBridge` section in the networks package file (see an [example](https://github.com/unlock-protocol/unlock/blob/15c396ea583dc9fa2d6901d68c478a6a3f93b077/packages/networks/src/networks/optimism.ts#L22C2-L29C5))
- [ ] setup modules correctly in network SAFE by running the command
      `yarn hardhat safe:submit --proposal proposals/enableModule.js --network <xxx>`
