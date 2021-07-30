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


### Deployment

For Rinkeby

- create a `mnemonic.rinkeby` files with the words
- `export RINKEBY_PROVIDER_URL=https://eth-rinkeby.alchemyapi.io/v2/<key>`
- `npx hardhat run scripts/udt-upgrade.js --network rinkeby`

For Mainnet

- create a `mnemonic.mainnet` files with the words
- `export MAINNET_PROVIDER_URL=https://eth-rinkeby.alchemyapi.io/v2/<key>`
- `npx hardhat run scripts/udt-upgrade.js --network mainet`

### Verify contracts

Verify and submit contract code on etherscan
```
npx hardhat run scripts/verify.js --network rinkeby
```


