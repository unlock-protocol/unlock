# Integration tests

This folder contains tests to make sure that the different parts of the Unlock Protocol play nicely together (i.e. contracts, subgraph, server, ui, etc...).

## Run the tests

For subgraph test

```
yarn test
```

## Development

First start a fully provisioned ETH node (with the Unlock contracts deployed and set correctly) and a subgraph indexing correctly.

```
yarn start:infra
```

then you need to export the subgraph URL, rebuild the networks package and run the test

```shell
export SUBGRAPH_URL=http://localhost:8000/subgraphs/name/testgraph

# add localhost to networks package
yarn test:prepare

# run actual test against local eth/subgraph nodes
yarn test --network localhost
```

## Add a test

1. Run The Unlock protocol on your machine (see the Development section above)

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
