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

# export envs
source ./scripts/start/envs.sh

# bring containers down
docker compose $COMPOSE_CONFIG down

# delete locksmith db
locksmith_postgres_instance=$(docker ps -a --no-trunc -q --filter name=^/locksmith-postgres)
if [ -n "$locksmith_postgres_instance" ]; then
  docker rm -f $locksmith_postgres_instance
fi

# kill possible running apps
# kill $(ps aux | grep unlock | awk '{print $2}')