#!/usr/bin/env bash
set -e

# First this script will deploy from an instance of unlock:latest
REPO_ROOT=`dirname "$0"`/..
BASE_DOCKER_COMPOSE=$REPO_ROOT/docker/docker-compose.yml
DOCKER_COMPOSE_FILE=$REPO_ROOT/docker/docker-compose.integration.yml
EXTRA_ARGS=$*

COMPOSE_CONFIG="-f $BASE_DOCKER_COMPOSE -f $DOCKER_COMPOSE_FILE"

# Setting the right env var
export UNLOCK_ENV=test

mkdir -p /tmp/screenshots
chmod 0777 /tmp/screenshots

# clean things up 
docker-compose $COMPOSE_CONFIG down

# Take ETH node up
docker-compose $COMPOSE_CONFIG up -d postgres ipfs graph-node eth-node

# Deploy Unlock etc
docker-compose $COMPOSE_CONFIG exec eth-node yarn provision --network docker

# Make the correct subgraph config
docker-compose $COMPOSE_CONFIG exec eth-node cat networks.json > ./docker/development/subgraph/networks.json

# docker-compose $COMPOSE_CONFIG exec eth-node cat networks.json

# Deploy the subgraph
docker-compose $COMPOSE_CONFIG up subgraph

# And then run the integration tests
# COMMAND="yarn run ci"
# docker-compose $COMPOSE_CONFIG run -e UNLOCK_ENV=test $EXTRA_ARGS integration-tests bash -c "$COMMAND"
