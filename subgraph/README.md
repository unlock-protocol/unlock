This package contains the source code for the Unlock Protocol Subgraph, a project for
indexing and querying Unlock Protocol data from the Ethereum blockchain using [The Graph](https://thegraph.com).

## Quick Start

### Running a local Graph Node with Docker Compose

The quickest way to run a Graph Node locally is to use the
[graph-node docker image](https://hub.docker.com/r/graphprotocol/graph-node/).

1. Install [Docker](https://docs.docker.com) and [Docker Compose](https://docs.docker.com/compose/install/)
2. In the root of this project run `docker-compose up`

This command will look for the `docker-compose.yml` file and automatically provision a server with rust, postgres, and ipfs, and
spin up a graph node with a GraphiQL interface at `http://127.0.0.1:8000/`.
You are now ready to build and deploy the Unlock Protocol subgraph.

### Building and Deploying the Unlock Protocol Subgraph

### Updating The Subgraph

After sometime with our subgraphs in production we have updated the tooling to better support our usage.

The endgoal is to be able to easily deploy the same code to its respective subgraph any of the existing networks.

## Building the subgraph.yml file

In addition to the entities and handlers to be utilized, the file also includes the lock contract address and the relevant network name. In making this process easier, this file is now generated based upon a template.

Generate via the build script:

`yarn build --network {network name}`

## Generating code

With `subgraph.yaml` created, we should generate the associated code with the following:
`yarn run codegen`


## The following commands have been introduced:

These command require the passing of the following command line arguments `--network` & `--environment`.

* `yarn run deploy` - Deploy the latest subgraph code to the graph node

Note: `polygon` is called `matic` in the graph. Please change the subgraph.yaml file manually.


## Build deps files 

Generate the `networks.json` file from the `@unlock-protocol/networks` package

```
yarn generate-networks
```

Generate the abis file from the `@unlock-protocol/contracts` package

```
yarn generate-abis
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

Show all events from different contract versions  

```
yarn show-events
```
