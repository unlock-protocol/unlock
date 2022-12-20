# Integration tests

This folder contains tests to make sure that the different parts of the Unlock Protocol plays nicely together (i.e. contracts, subgraph, server, ui, etc...).

## Run the entire test suite

```
sh ./bin/tests.sh run
```

## Development

For development, you will need to first launch an ETH node, deploy the Unlock contracts and subgraph.

The ETH node [provisioning script](../docker/development/eth-node/scripts/provision.ts) deploy a fresh instance of the Unlock contract, create a few locks and purchase some keys.

### Boostrap e2e env using Docker (for CI)

Run everything containerized (mimick the CI context)

```
sh ./bin/tests.sh
```

### Boostrap e2e env locally

Run deployment and provisioning from your local machine (usually faster)

```shell
sh ./bin/tests-local.sh run
```

### Run the tests

Then run the tests against the local instance of the protocol

```
yarn test --network localhost
```

## Add a test

1. Run the The Unlock protocol using docker: `sh ./bin/tests.sh`.

2. Create a file in the `/test` folder with your logic.

- The tests are run using hardhat and uses [mocha](https://mochajs.org) syntax.
- You can access the Unlock contract by using the `unlock` object from hardhat -- created by importing `[hardhat plugin](../packages/hardhat-plugin/)`.
- Example:

```js
import { unlock } from 'hardhat'

describe('Unlock', function () {
  it('creates a simple lock', function () {
    const { lock } = await unlock.createLock({ ...lockParams })
    expect(await lock.name()).to.equals(lockParams.name)
  })
})
```

3. Run all tests using `yarn test` or a single file using `yarn test test/<yourfile>.ts`. All files added to the `test` folder will run on CI once uploaded to Github.
