#!/usr/bin/env bash
set -e

# deploy contracts
cd $REPO_ROOT/docker/development/eth-node
yarn
yarn provision --network localhost

# prepare subgraph deployment
cd $REPO_ROOT/subgraph
yarn prepare:abis

# copy local networks files 
yarn prepare:test
yarn graph codegen
yarn graph build --network localhost

# now deploy the subgraph
yarn workspace @unlock-protocol/subgraph graph create testgraph --node http://localhost:8020/
yarn graph deploy testgraph --node=http://localhost:8020/ --ipfs=http://localhost:5001 --version-label=v0.0.1 --network=localhost


