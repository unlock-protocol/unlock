This package contains the source code for Unlock Protocol subgraph, that
indexes and allows easier querying from the EVM blockchains using [The Graph](https://thegraph.com).

### Building the subgraph

```sh
# create correct ABIs and config files
yarn prepare

# build Web Assembly binaries
yarn build <network-name>
```

### Config

#### Multiple chains

There is subgraph deployed for each network where Unlock Protocol is deployed. While code is similar for all, the addresses where the contracts are deployed vary, requiring a specifying config per network stored in `networks.json`. All networks are also generated into their own json file in the `/configs` folder with the same information.

The `networks.json` file and `/config` files are generated from our `@unlock-protocol/networks` package.

```sh
# build the `subgraph.yaml` with the correct contract address per network
yarn prepare:networks
```

#### Contract ABIs

Unlock's contracts are upgradable, we parse the multiple ABIs that are required from our `@unlock-protocol/contracts` package.

```sh
# parse and build the require ABIs
yarn prepare:abis
```

#### Generating Manifest & Building Subgraph

To build any network. This will generate the network configs, prepare the abis and generate the manifest for the subgraph according to the network configuration.

```sh
# build & generate
yarn run build <network-name>
```

### Deploying The Subgraph

Deploy the latest code to subgraph studio

```sh
export SUBGRAPH_STUDIO_DEPLOY_KEY=<api-key>

# deploy a single network
yarn run deploy <network-name>

# deploy all available networks to hosted service
yarn run deploy-all
```

NB: You need to set `studioName` in the networks package. The `--label` flag can be passed manually else it will be increased automatically.

## Tests

(preferred way) Run the tests using Docker

```
yarn test -d
```

Run coverage

```
yarn test -d -c
```

## Helpers

Show all events from different contract versions.

```sh
yarn show-events
```

## Add to the subgraph

To add a particular property to the subgraph you need to

1. add to schema
2. edit the mappings
3. update ../tests/subgraph.test.yaml to match new manifest
4. test it
5. republish the new subgraph

### add to schema

```diff
@@ -7,6 +7,7 @@ type Lock @entity {
   version: BigInt!
+  maxNumberOfKeys: BigInt
   keys: [Key!] @derivedFrom(field: "lock")
 }
```

Rebuild the code

```
yarn codegen
```

### edit mappings

in `src/unlock.ts`, to store data into the graph

```diff
export function handleNewLock(event: NewLock): void {
  ...
+  // make sure we check for revert to previous various versions from breaking
+  let maxNumberOfKeys = lockContract.try_maxNumberOfKeys()
+  if (!publicLockVersion.reverted) {
+    lock.maxNumberOfKeys = maxNumberOfKeys.value
+  }
+
```

### add a test

The unit tests are used to make sure we properly handle the data from a specific event. We test event handlers with known data. For instance, the event `NewLock(address,address)` has a handler called `handleNewLock` that stores the data in the graph.

We create a "fake" event with intended parameters to pass the handler function from our library. We use a `createNewLockEvent` in `tests/lock-utils.ts` that creates an event, then test it as follow:

```js
import { handleNewLock } from '../src/unlock'
import { maxNumberOfKeys } from './constants'

describe('Describe Lock creation', () => {
  beforeAll(() => {
    const newLockEvent = createNewLockEvent(
      Address.fromString(lockOwner),
      Address.fromString(lockAddress)
    )
    handleNewLock(newLockEvent)
  })

  afterAll(() => {
    clearStore()
  })

  test('Lock created and stored', () => {
    assert.entityCount('Lock', 1)
    ...
    assert.fieldEquals('Lock', lockAddress, 'maxNumberOfKeys', maxNumberOfKeys)
    ...
  })
```

#### Mocking contract calls

If the handler does any calls to a contract, this will have to be mocked. All mocks are stored in `tests/mocks`.

```js
import { maxNumberOfKeys } from './constants'

createMockedFunction(
  Address.fromString(lockAddress),
  'maxNumberOfKeys',
  'maxNumberOfKeys():(uint256)'
)
  .withArgs([])
  .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromU32(maxNumberOfKeys))])
```

## Debug deployed Subgraph

To retrieve the error message for failed subgraphs - on the hosted service

- Find your Deployment ID ("Qm....")
- Go to https://graphiql-online.com/
- Enter API https://api.thegraph.com/index-node/graphql
- Run Query:

```graphql
{
  indexingStatuses(subgraphs: ["Qm..."]) {
    subgraph
    synced
    health
    entityCount
    fatalError {
      handler
      message
      deterministic
      block {
        hash
        number
      }
    }
    chains {
      chainHeadBlock {
        number
      }
      earliestBlock {
        number
      }
      latestBlock {
        number
      }
    }
  }
}
```
