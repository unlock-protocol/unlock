#!/usr/bin/env bash
set -e

# parse networks file when running on CI
INFO_FILE_PATH="$REPO_ROOT/docker/development/eth-node/networks.json"

# default subgraph URL
if [ -z "${SUBGRAPH_URL}" ]; then 
  SUBGRAPH_URL=http://localhost:8000/subgraphs/name/testgraph
fi

# make sure file exists
if [ -f "$INFO_FILE_PATH" ]; then
  echo "Using subgraph file at: $INFO_FILE_PATH"
else 
  echo "File does not exist: $INFO_FILE_PATH"
  exit 1
fi

# parse Unlock address from network info file
unlock_adress=$(yarn workspace @unlock-protocol/networks unlock-address "$INFO_FILE_PATH")
if [ ! -n $unlock_adress ]; then 
  echo "Missing Unlock Address"
  exit 1
fi

# create localhost file in networks package
yarn workspace @unlock-protocol/networks create-localhost "$unlock_adress" "$SUBGRAPH_URL"

# append to networks index
echo "export * from './localhost'" >> "$REPO_ROOT/packages/networks/src/networks/index.ts"

# rebuild networks
yarn workspace @unlock-protocol/networks build


