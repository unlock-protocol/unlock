#!/usr/bin/env bash

set -e

echo "Preparing Unlock local subgraph..."

# generate ts code from ABIs
yarn workspace @unlock-protocol/subgraph prepare:abis
echo -e "✔ Unlock local ABI prepared\n\n"

yarn workspace @unlock-protocol/subgraph copy:manifest

yarn workspace @unlock-protocol/subgraph graph codegen
echo -e "✔ Unlock local code generated\n\n"

# build the subgraph files
# show networks
yarn workspace @unlock-protocol/subgraph graph build --network localhost
echo -e "✔ Unlock local subgraph built\n\n"

# init the graph
yarn workspace @unlock-protocol/subgraph run graph create testgraph --node http://graph-node:8020/
echo -e "✔ Unlock local subgraph initiated\n\n"

# deploy
yarn workspace @unlock-protocol/subgraph run graph deploy testgraph --node http://graph-node:8020/ --ipfs http://ipfs:5001 --version-label 0.0.1 --network localhost
echo -e "✔ Unlock local subgraph deployed\n\n"