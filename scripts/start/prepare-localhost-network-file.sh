#!/usr/bin/env bash
set -e

# parse networks file when running on CI
INFO_FILE_PATH="$REPO_ROOT/docker/development/eth-node/networks.json"

# use docker mounted file on CI
if [ ! -z "${CI}" ]; then 
  INFO_FILE_PATH='/home/unlock/networks.json'
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
yarn workspace @unlock-protocol/networks create-localhost "$unlock_adress" http://graph-node:8000/subgraphs/name/testgraph

# append to networks index
echo "export * from './localhost'" >> "$REPO_ROOT/packages/networks/src/networks/index.ts"

# rebuild networks
yarn workspace @unlock-protocol/networks build


