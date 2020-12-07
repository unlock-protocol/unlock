#!/usr/bin/env bash

# this script runs the test in the service provided as first argument

SERVICE=$1
REPO_ROOT=`dirname "$0"`/..
BASE_DOCKER_COMPOSE=$REPO_ROOT/docker/docker-compose.yml
DOCKER_COMPOSE_FILE=$REPO_ROOT/docker/docker-compose.ci.yml
COMMAND="yarn run ci"


# Setting the right env var
export UNLOCK_ENV=test

# Build image
UNLOCK_ENV=test docker-compose -f ./docker/docker-compose.yml -f ./docker/docker-compose.ci.yml build $SERVICE

# Push image
scripts/push-images.sh unlock-core $SERVICE