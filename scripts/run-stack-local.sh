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


REPO_ROOT=`pwd`/`dirname "$0"`/..
echo "running from: $REPO_ROOT"
BASE_DOCKER_FOLDER=$REPO_ROOT/docker
BASE_DOCKER_COMPOSE=$BASE_DOCKER_FOLDER/docker-compose.yml
DOCKER_COMPOSE_FILE=$BASE_DOCKER_FOLDER/docker-compose.integration.yml

COMPOSE_CONFIG="-f $BASE_DOCKER_COMPOSE -f $DOCKER_COMPOSE_FILE"

# Setting the right env var
export UNLOCK_ENV=test

# clean things up 
docker-compose $COMPOSE_CONFIG down

# Take db, IPFS, graph and postgres nodes up
docker-compose $COMPOSE_CONFIG up -d postgres ipfs graph-node eth-node

# deploy contracts
cd $REPO_ROOT/docker/development/eth-node
yarn
yarn provision --network localhost

# prepare subgraph deployment
cd $REPO_ROOT/subgraph
yarn prepare:abis

yarn prepare:test
yarn codegen
yarn graph build --network localhost

# now deploy the subgraph
yarn workspace @unlock-protocol/subgraph run graph create testgraph --node http://localhost:8020/
yarn graph deploy testgraph --node=http://localhost:8020/ --ipfs=http://localhost:5001 --version-label=v0.0.1 --network=localhost

# start 2nd postgres instance for locksmith
docker run --name locksmith-postgres -p 5433:5432 -e POSTGRES_PASSWORD=postgres -e POSTGRES_USER=postgres -e POSTGRES_DB=locksmith -d postgres

# setup db
export DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5433/locksmith
yarn workspace @unlock-protocol/locksmith db:migrate

# run locksmith 
# TODO: detach lockmsith from shell
yarn workspace @unlock-protocol/locksmith start


# TODO: run websub
# yarn workspace @unlock-protocol/websub

# run unlock-app
export NEXT_PUBLIC_LOCKSMITH_URI=http://localhost:8080
export NEXT_PUBLIC_UNLOCK_ENV=dev
yarn workspace @unlock-protocol/unlock-app start
