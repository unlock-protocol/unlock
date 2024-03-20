#!/usr/bin/env bash
set -e

FOLDER_ROOT="$(pwd)/.."

# parse networks file when running on CI
INFO_FILE_PATH="$FOLDER_ROOT/docker/development/eth-node/networks.json"

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
unlock_adress=$(cat "$INFO_FILE_PATH" | jq -r '.localhost.Unlock.address')
if [ ! -n $unlock_adress ]; then 
  echo "Missing Unlock Address"
  exit 1
fi

# create localhost file in networks package
yarn workspace @unlock-protocol/networks create-localhost "$unlock_adress"

# append to networks index
echo "export * from './localhost'" >> "$FOLDER_ROOT/packages/networks/src/networks/index.ts"

# rebuild networks
yarn workspace @unlock-protocol/networks build

# rebuild unlock-js to get latest networks package
yarn workspace @unlock-protocol/unlock-js build

