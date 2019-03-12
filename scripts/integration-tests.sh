#!/usr/bin/env bash

# set the environment variables needed for integration tests
. $REPO_ROOT/scripts/integration-envs.sh

# First this script will deploy from an instance of unlock:latest
REPO_ROOT=`dirname "$0"`/..
DOCKER_COMPOSE_FILE=$REPO_ROOT/docker/docker-compose.ci.yml

# Run the tests
COMMAND="npm run ci"

docker-compose -f $DOCKER_COMPOSE_FILE run integration-tests bash -c "$COMMAND"
