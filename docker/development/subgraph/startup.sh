#!/usr/bin/env bash

set -e

echo "Preparing Unlock local subgraph..."

# show networks
cat /home/unlock/subgraph/networks.json

# generate ts code from ABIs
yarn workspace @unlock-protocol/subgraph prepare:abis
echo -e "✔ Unlock local ABI prepared\n\n"

yarn workspace @unlock-protocol/subgraph codegen
echo -e "✔ Unlock local code generated\n\n"

# show cli version
yarn workspace @unlock-protocol/subgraph run graph --version

# build the subgraph files
yarn workspace @unlock-protocol/subgraph run build localhost
echo -e "✔ Unlock local subgraph built\n\n"

# init the graph
yarn workspace @unlock-protocol/subgraph run graph create testgraph --node http://graph-node:8020/
echo -e "✔ Unlock local subgraph initiated\n\n"

# deploy
yarn workspace @unlock-protocol/subgraph run graph deploy testgraph --node http://graph-node:8020/ --ipfs http://ipfs:5001 --network localhost
echo -e "✔ Unlock local subgraph deployed\n\n"