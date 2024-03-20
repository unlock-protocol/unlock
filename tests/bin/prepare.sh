# this file is used to create a localhost network file

# parse networks file when running on CI
INFO_FILE_PATH=/home/unlock/networks.json
unlock_adress=$(cat "$INFO_FILE_PATH" | jq -r '.localhost.Unlock.address')

# create localhost file in networks package
yarn workspace @unlock-protocol/networks create-localhost "$unlock_adress"

# append to networks index
echo "export * from './localhost'" >> src/networks/index.ts

# rebuild networks
yarn workspace @unlock-protocol/networks build

# rebuild unlock-js to get latest networks package
yarn workspace @unlock-protocol/unlock-js build

