# Smart Contracts

See [our docs](https://docs.unlock-protocol.com/developers/smart-contracts-architecture) for an overview of the smart contracts and [the smart-contract-extensions repo](https://github.com/unlock-protocol/unlock/tree/master/smart-contract-extensions) for integration examples. The deployment process itself is [on our wiki](https://github.com/unlock-protocol/unlock/wiki/Releasing-a-new-version-of-the-contracts).

To run:

```
yarn
yarn ganache
```

and then in a second console:

```
yarn build
yarn test
```

## Run with Hardhat

```
npx hardhat node
```

This will run all contracts deployment/migrations at start

If you want to run them separately

```
npx hardhat deploy
```

#### Run the tests

```
npx hardhat test
```

To see all emitted events

```
npx hardhat test --logs
```

### Upgrade UDT to be Openzeppelin 4.0 compatible0

```
genV2/run.sh 
```