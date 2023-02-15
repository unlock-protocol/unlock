# Integration tests

This folder contains tests to make sure that the different parts of the Unlock Protocol plays nicely together (i.e. contracts, subgraph, server, ui, etc...).

## Run the tests

For subgraph test

```
yarn test
```

## Development

For development, you need a fully provisioned ETH node (with the Unlock contracts deployed and set correctly) and a subgraph indexing correctly. You can use scripts from our [`scripts`](../scripts) folder (at the root of the repo) to kickstart a fully configured instance of the protocol, either dockerized or directly from your local repo.

NB: the ETH node [provisioning script](../docker/development/eth-node/scripts/provision.ts) will create a few locks and purchase some keys.

#### Boostrap dev env locally

Run deployment and provisioning from your local machine (usually faster)

```shell
sh ../scripts/run-stack-local.sh
```

#### Boostrap dev env dockerized

```shell
sh ../scripts/run-stack-dockerized.sh
```

#### Run test suite for development

Run the tests against the newly deployed instance of the protocol

```
yarn test --network localhost
```

## Add a test

1. Run the The Unlock protocol on your machine (see the Development section above)

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
