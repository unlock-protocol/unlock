# Smart Contracts

**This folder contains versions of Unlock protocol contracts that are currently UNDER DEVELOPMENT. For applications, please refer to the code in [@unlock-protocol/contracts](../packages/contracts) or directly use the npm package [`@unlock-protocol/contracts`](https://npmjs.com/package/@unlock-protocol/contracts)**

You can also use the `../governance` folder to deploy Unlock on new networks and/or perform upgrades of existing networks.

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

## Deploy Governor + Timelock

```
yarn hardhat deploy:governor

Deploying Governor on localhost with the account: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266...
> Timelock w proxy deployed at: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
> Governor deployed (w proxy) at: 0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9
> Governor added to Timelock as sole proposer.  0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9 is Proposer: true
> Unlock Owner recounced Admin Role.  0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 isAdmin: false
```

## Release a new version of a contract

1. Create a PR where you update the version number in the contract
2. Make you changes and add/fix relevant tests
3. add an upgrade test following the model in `test/Lock/upgrades` folder
4. Release the new versions of the contracts into the `contracts` package
   using the following command.

```
yarn hardhat release --contract contracts/<xxx>.sol
```

5. Bump version number and edit changelog in `contracts` package
6. Once your release is ready to roll, update the `UNLOCK_LATEST_VERSION` and `PUBLICLOCK_LATEST_VERSION` in both contracts and hardhat-plugin package.
7. Update unlockjs lib with new features and changes
8. Update unlock-app to use the newest version of unlockjs
9. Deploy a test version on testnet (Sepolia) to be tested against the staging website

```
yarn hardhat deploy:protocol-upgrade --unlock-version <xxx> --public-lock-version <xxx> --network sepolia
```

10. For DAO-governed chains, deploy implementations for all networks and send a (cross-chain) proposal with the upgrade logic (following the [previous proposal](../governance/proposals/udt/009-protocol-upgrade.js) as template ).

```
# for unlock
yarn hardhat unlock:upgrade --unlock-version <xxx>

# for publiclock
yarn hardhat deploy:template --public-lock-version <xxx>
```

11. For other chains, you can send directly a tx to the team multisig using

```
yarn hardhat deploy:protocol-upgrade --unlock-version <xxx> --public-lock-version <xxx> --network <xxx>
```

12. Once all txs from dao and multisig have been executed, update the `publicLockVersionToDeploy` param in all network files of the networks package to the latest publicLock version

## Locks

### Serialize an existing lock

```
# deploy LockSerializer contract
yarn deploy:serializer --network localhost

# copy data of a lock locally
yarn hardhat lock:serialize --lock-address 0x... --deployer-address 0x... -- --network localhost
```
