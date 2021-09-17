# Smart Contracts

See [our docs](https://docs.unlock-protocol.com/developers/smart-contracts-architecture) for an overview of the smart contracts and [the smart-contract-extensions repo](https://github.com/unlock-protocol/unlock/tree/master/smart-contract-extensions) for integration examples. The deployment process itself is [on our wiki](https://github.com/unlock-protocol/unlock/wiki/Releasing-a-new-version-of-the-contracts).

## Run locally

```
yarn install
npx hardhat node
```

Then you can deploy the contracts locally

```
npx hardhat run scripts/deploy.js
```

### Run the tests

```
npx hardhat test
```

To see all emitted events

```
npx hardhat test --logs
```

### Run a mainnet fork

Mainnet [forking with Hardhat](https://hardhat.org/guides/mainnet-forking.html#forking-from-mainnet) relies on alchemy.com to retrieve chain archival data. An API key is required

To test on a mainnet fork, you need to export `RUN_MAINNET_FORK=1` and  `ALCHEMY_API_KEY=<xxx>` to your env

ex .
```
export RUN_MAINNET_FORK=1
export ALCHEMY_API_KEY=<xxx>

npx hardhat node
// Running a mainnet fork...
```

Once you have mainnet running locally, you can run the relevant tests in another terminal:

```
export RUN_MAINNET_FORK=1
npx hardhat --network localhost test test/UnlockDiscountToken/upgrades.mainnet.js
```

Note that if the var `RUN_MAINNET_FORK` is not set, the mainnet tests are skipped and will be marked as pending on the CI.


### Setup networks

To set up a network for deployment, you need 2 things

1. create a plain text mnemonic file containing the words `mnemonic.<NETWORK NAME>`

2. export the provider url to your shell env

#### Example : Rinkeby

```
# store menmonic words in file
cat mnemonic.rinkeby

module.exports = {
  mnemonic: "blah blah...",
  initialIndex: 2
}

# export Alchemy/Infura URL
export RINKEBY_PROVIDER_URL=https://eth-rinkeby.alchemyapi.io/v2/<key>
```

### Run the UDT contract upgrade

Once your network are setup, you can run the UDT contract upgrade

```
npx hardhat run scripts/udt-upgrade.js --network rinkeby
```


## Upgrade a contract

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

```
# deploy a new template
yarn deploy template

# verify the contract
ETHERSCAN_API_KEY=<your api key> yarn verify <template-address>

# Set the template
yarn set template --unlock-address <xxx> --public-lock-address <template-address>
```

## Deploy the contracts

### Deploy all

You can setup an entire environment using

```
yarn deploy-all 
```

Or deploy different part separately

```
yarn deploy unlock
yarn deploy udt
yarn deploy weth
yarn deploy uniswap --weth-address 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
yarn deploy oracle --uniswap-factory-address 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
# etc.
```

see `yarn deploy --help` for a list of all available deployments


### Update Unlock config

```
yarn set unlock-config --unlock-address <xxx> \
  --udt-address <xxx>
  --wethAddress <xxx>
  --estimatedGasForPurchase <xxx>
  --locksmithURI <xxx>
```

## Governor + Timelock

```
yarn deploy governor

Deploying Governor on localhost with the account: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266...
> Timelock w proxy deployed at: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
> Governor deployed (w proxy) at: 0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9
> Governor added to Timelock as sole proposer.  0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9 is Proposer: true
> Unlock Owner recounced Admin Role.  0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 isAdmin: false
````