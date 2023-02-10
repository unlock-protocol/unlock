#!/usr/bin/env bash
REPO_ROOT=`dirname "$0"`/../..

# fetch compose config paths
BASE_DOCKER_FOLDER=$REPO_ROOT/docker
BASE_DOCKER_COMPOSE=$BASE_DOCKER_FOLDER/docker-compose.yml
DOCKER_COMPOSE_FILE=$BASE_DOCKER_FOLDER/docker-compose.integration.yml
COMPOSE_CONFIG="-f $BASE_DOCKER_COMPOSE -f $DOCKER_COMPOSE_FILE"

# Setting the right env var
export UNLOCK_ENV=test

echo "Running integration tests \n"
COMMAND="yarn workspace tests test --network docker"
docker-compose $COMPOSE_CONFIG build integration-tests
docker-compose $COMPOSE_CONFIG run -e UNLOCK_ENV=test -e CI=true $EXTRA_ARGS integration-tests bash -c "$COMMAND"
