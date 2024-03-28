#!/usr/bin/env bash

#
# This will start the frontend apps from the local repository.
# You are required to run `./scripts/start-infra.sh` first to create 
# and provision local node instances of eth/evm and the corresponding subgraph.
#

set -e

# export required envs
source ./scripts/start/envs.sh

# create localhost file in networks package
./scripts/start/prepare-localhost-network-file.sh

# rebuild unlock-js to include latest networks package
yarn workspace @unlock-protocol/unlock-js build

# start 2nd postgres instance for locksmith
docker run --name locksmith-postgres -p 5433:5432 -e POSTGRES_PASSWORD=postgres -e POSTGRES_USER=postgres -e POSTGRES_DB=locksmith -d postgres

# setup db
export DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5433/locksmith
yarn workspace @unlock-protocol/locksmith db:migrate

# run locksmith + workers (detached)
nohup yarn workspace @unlock-protocol/locksmith dev &
# nohup  yarn workspace @unlock-protocol/locksmith worker:dev &

# run unlock-app
export NEXT_PUBLIC_LOCKSMITH_URI=http://localhost:8080
export NEXT_PUBLIC_UNLOCK_ENV=dev
yarn workspace @unlock-protocol/unlock-app start


