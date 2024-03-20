#!/usr/bin/env bash
set -e

# First this script will deploy 
REPO_ROOT=`dirname "$0"`/..

# fetch compose config paths
BASE_DOCKER_FOLDER=$REPO_ROOT/docker
BASE_DOCKER_COMPOSE=$BASE_DOCKER_FOLDER/docker-compose.yml
DOCKER_COMPOSE_FILE=$BASE_DOCKER_FOLDER/docker-compose.integration.yml
COMPOSE_CONFIG="-f $BASE_DOCKER_COMPOSE -f $DOCKER_COMPOSE_FILE"

# run Unlock Protocol stack
sh -c "$REPO_ROOT/scripts/run-stack-dockerized.sh"

# Setting the right env var
export UNLOCK_ENV=test

# run the actual tests
echo "Running integration tests \n"
COMMAND="yarn workspace tests ci --network docker"
docker-compose $COMPOSE_CONFIG build integration-tests
docker-compose $COMPOSE_CONFIG run -e UNLOCK_ENV=test -e CI=true $EXTRA_ARGS integration-tests bash -c "$COMMAND"
