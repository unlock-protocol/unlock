# this file is used to create a localhost network file

# networks file path when running on CI
INFO_FILE_PATH=/home/unlock/networks.json

# create localhost file in networks package
yarn workspace @unlock-protocol/networks create-localhost "$INFO_FILE_PATH"
yarn workspace @unlock-protocol/networks build

# rebuild unlock-js to get latest networks package
yarn workspace @unlock-protocol/unlock-js build

