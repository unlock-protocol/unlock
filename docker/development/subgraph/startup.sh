#!/usr/bin/env bash

echo "Migrating subgraph..."

# create config file
yarn workspace @unlock-protocol/subgraph generate-subgraph-yaml

# generate ts code 
yarn workspace @unlock-protocol/subgraph codegen

# build the subgraph files
yarn workspace @unlock-protocol/subgraph build --network mainnet

# init the graph
yarn workspace @unlock-protocol/subgraph run create --network mainnet

# deploy
yarn workspace @unlock-protocol/subgraph run deploy --network mainnet --label 0.0.1
