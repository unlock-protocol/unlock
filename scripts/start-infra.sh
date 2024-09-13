#!/usr/bin/env bash

#
# This will start and provision nodes with the Unlock Protocol (deploy contracts and graph)
# from the local repository. This is useful when developing and testing things locally.
#
# You are required to run first `yarn && yarn build` from the root of this repo, to install and
# prepare deps. Docker is required to run instances of infrastructure providers such as 
# Ethereum node, Graph node,  Postgres db and IPFS.
#

set -e

# export required envs
source ./scripts/start/envs.sh

# remove previous running instances
./scripts/stop.sh

# Take DB, IPFS, graph and postgres nodes up
docker compose $COMPOSE_CONFIG up -d --build postgres ipfs graph-node eth-node

# deploy contracts and subgraph
./scripts/start/provision.sh