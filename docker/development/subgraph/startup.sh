#!/usr/bin/env bash

echo "Migrating subgraph..."

# show networks
cat /home/unlock/subgraph/networks.json

# generate ts code 
yarn workspace @unlock-protocol/subgraph codegen

# build the subgraph files
yarn workspace @unlock-protocol/subgraph build --network localhost

# init the graph
yarn workspace @unlock-protocol/subgraph run graph create testgraph --node http://graph-node:8020/ --version 0.0.1

# deploy
yarn workspace @unlock-protocol/subgraph run graph deploy testgraph --node http://graph-node:8020/ --ipfs http://ipfs:5001 --version-label 0.0.1 --network localhost
