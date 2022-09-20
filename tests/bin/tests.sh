#!/usr/bin/env bash
set -e

REPO_ROOT=`dirname "$0"`/../..
BASE_DOCKER_FOLDER=$REPO_ROOT/docker
BASE_DOCKER_COMPOSE=$BASE_DOCKER_FOLDER/docker-compose.yml
DOCKER_COMPOSE_FILE=$BASE_DOCKER_FOLDER/docker-compose.integration.yml

COMPOSE_CONFIG="-f $BASE_DOCKER_COMPOSE -f $DOCKER_COMPOSE_FILE"

# Setting the right env var
export UNLOCK_ENV=test

# clean things up 
docker-compose $COMPOSE_CONFIG down

# Take ETH node up
docker-compose $COMPOSE_CONFIG up -d postgres ipfs graph-node eth-node

# Deploy Unlock etc
docker-compose $COMPOSE_CONFIG exec -T eth-node yarn provision --network docker

# Make the correct subgraph config
docker-compose $COMPOSE_CONFIG exec -T eth-node cat networks.json > $BASE_DOCKER_FOLDER/development/subgraph/networks.json

# show subgraph networks config (for debug purposes)
docker-compose $COMPOSE_CONFIG exec -T eth-node cat networks.json

# deploy the subgraph
docker-compose $COMPOSE_CONFIG up --build subgraph

# Launch
# docker-compose $COMPOSE_CONFIG up --build locksmith websub unlock-app 

# Run the integration tests if needed
if [ "$1" == 'run' ]
then
  echo "Running integration tests \n"
  COMMAND="yarn run ci"
  docker-compose $COMPOSE_CONFIG run -e UNLOCK_ENV=test $EXTRA_ARGS integration-tests bash -c "$COMMAND"
fi