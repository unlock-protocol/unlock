#!/usr/bin/env bash

#
# This will run an instance of the unlock protocol tooling (deploy contracts, graph, and apps)
# from the local repository. This is useful when developing and testing things locally.
#
# You are required to run first `yarn && yarn build` from the root of this repo, to install and
# prepare deps. Docker is required to run instances of infrastructure providers such as 
# Ethereum node, Graph node,  Postgres db and IPFS.
#
# To run the protocol entirely with docker , see `run-stack-dockerized.sh`

set -e

export REPO_ROOT=$(realpath `pwd`/`dirname "$0"`/..)
echo "running from: $REPO_ROOT"
COMPOSE_CONFIG="-f $REPO_ROOT/docker/docker-compose.yml -f $REPO_ROOT/docker/docker-compose.integration.yml"

# Setting the right env var
export UNLOCK_ENV=test

# clean things up 
./scripts/stop.sh

# Take DB, IPFS, graph and postgres nodes up
docker-compose $COMPOSE_CONFIG up -d postgres ipfs graph-node eth-node

# deploy contracts and subgraph
./scripts/start/provision.sh

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


