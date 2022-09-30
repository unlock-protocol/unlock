# !/usr/bin/env bash

OPEN_API_FILEPATH="${1:-"../../locksmith/openapi.yml"}"

# clean generated folder
rm -rf src/@generated

yarn openapi-generator-cli generate -i $OPEN_API_FILEPATH -g typescript-axios -c ./openapi.ts.config.json -o ./src/@generated/client
