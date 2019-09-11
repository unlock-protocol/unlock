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

Next run:

```
npm run codegen
npm run deploy
```