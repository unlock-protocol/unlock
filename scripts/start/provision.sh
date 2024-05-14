#!/usr/bin/env bash
set -e

# deploy contracts
cd $REPO_ROOT/docker/development/eth-node
yarn
yarn build
yarn provision --network localhost

# prepare subgraph deployment
cd $REPO_ROOT/subgraph
yarn prepare:abis

# copy local networks files 
yarn prepare:test
yarn graph codegen
yarn graph build --network localhost

# now deploy the subgraph
yarn graph create testgraph --node http://0.0.0.0:8020/
yarn graph deploy testgraph --node=http://0.0.0.0:8020/ --ipfs=http://0.0.0.0:5001 --version-label=v0.0.1 --network=localhost
