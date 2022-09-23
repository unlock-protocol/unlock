This package contains the source code for Unlock Protocol subgraph, that
index and allow easier querying from the Ethereum blockchain using [The Graph](https://thegraph.com).

### Building the subgraph

```sh
# create correct ABIs and config files
yarn prepare

# generate graph code from source
yarn codegen

# build Web Assemly binaries
yarn build --network <network-name>
```

### Config

#### Multiple chains

There is subgraph deployed for each network where Unlock Protocol is deployed. While code is similar for all, the addresses where the contracts are deployed vary, requiring a specifing config per network stored in `networks.json`.

The `networks.json` file is generated from our `@unlock-protocol/networks` package.

```sh
# build the `subgraph.yaml` with the correct contract address per network
yarn prepare:networks
```

#### Contrat ABIs

Are Unlock's contracts are upgreadable, we parse the multiple ABIs that are required from our `@unlock-protocol/contracts` package.


```sh
# parse and build the require ABIs
yarn prepare:abis
```

### Deploying The Subgraph

Deploy the latest subgraph code to the graph node.

```sh
export SUBGRAPH_DEPLOY_KEY=<api-key>

# build 
sh bin/thegraph deploy <network-name>

# deploy a single network
sh bin/thegraph deploy <network-name>

# deploy all networks
sh bin/thegraph deploy <network-name>
``` 

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
