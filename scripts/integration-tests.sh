#!/usr/bin/env bash
set -e

# export required envs
source ./scripts/start/envs.sh

# run Unlock Protocol stack
sh -c "./scripts/start-infra.sh"

# run the actual tests
echo "Running integration tests \n"
CI=true yarn workspace tests ci --network localhost
