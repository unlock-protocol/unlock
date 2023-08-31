#!/usr/bin/env bash

set -e

echo "Preparing Unlock local subgraph..."

# generate ts code from ABIs
yarn workspace @unlock-protocol/subgraph prepare:abis
echo -e "✔ Unlock local ABI prepared\n\n" 

# copy the generated subgraph config file
rm -rf $REPO_ROOT/subgraph/networks.json 
cp $REPO_ROOT/docker/development/eth-node/networks.json $REPO_ROOT/subgraph/networks.json

yarn workspace @unlock-protocol/subgraph generate-manifest base.json

yarn workspace @unlock-protocol/subgraph codegen
echo -e "✔ Unlock local code generated\n\n"

# build the subgraph files
# show networks
yarn workspace @unlock-protocol/subgraph run graph build --network localhost
echo -e "✔ Unlock local subgraph built\n\n"

# init the graph
yarn workspace @unlock-protocol/subgraph run graph create testgraph --node http://graph-node:8020/
echo -e "✔ Unlock local subgraph initiated\n\n"

# deploy
yarn workspace @unlock-protocol/subgraph run graph deploy testgraph --node http://graph-node:8020/ --ipfs http://ipfs:5001 --version-label 0.0.1 --network localhost
echo -e "✔ Unlock local subgraph deployed\n\n"