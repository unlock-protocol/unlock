#!/usr/bin/env bash

#
# Deployment for all the subgraph 
#
# Usage (ex):
# ````
# export SUBGRAPH_DEPLOY_KEY=<api-key>
# sh ./bin/deploy.sh goerli
# ```
#

set -e

network_name=$1

if [ -z "$1" ]; then 
  echo "Please specify the name of the network to deploy."; 
  exit 1 
fi

if [[ -z "${SUBGRAPH_DEPLOY_KEY}" ]]; then
  echo "A subgraph API key is required."; 
  exit 1 
fi

# Creating subgraphs is only available from hosted-service dashboard
# sh -c "yarn graph create $network_name-v2 --node https://api.thegraph.com/deploy/ --access-token $SUBGRAPH_DEPLOY_KEY" 

subgraph_name="$network_name-v2"

echo "deploying subgraph $subgraph_name..."

# prepare  files
yarn codegen 
yarn graph build --network $network_name

# deploy the graph
yarn graph deploy --network $network_name \
  --product hosted-service \
  --access-token $SUBGRAPH_DEPLOY_KEY \
  --node https://api.thegraph.com/deploy/ \
  --ipfs https://api.thegraph.com/ipfs/ \
  unlock-protocol/$subgraph_name
