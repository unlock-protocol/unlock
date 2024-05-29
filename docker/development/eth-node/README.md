# Unlock EVM Node

A standalone hardhat node, fully provisioned for Unlock local development and integration testing

## Prepare for Unlock dev

### Copy packages

As this folder is NOT integrated into the yarn monorepo setup, we need to manually copy packages
from the monorepo `packages` folder into a `./packages` in this directory.

```shell
# from the monorepo root folder
source ./scripts/start/envs.sh

# copy the packages
./scripts/start/copy-eth-node-packages.sh
```

### Start an ETH node

```
yarn
yarn build
yarn start
```

### Deploy contracts and sample locks

From a second shell

```
yarn provision --network localhost
```

NB: This will create a `networks.json` file that contains the address to Unlock factory contract
that can be used to locally deploy a subgraph for instance (see `yarn start` at repo root).

## Dockerize

```
# build container
docker build --rm -t eth-node .

# launch ETH node
docker run -it --rm -p 8545:8545 eth-node
```

Your node will be accessible locally using `hardhat run <xxx> --network localhost`
