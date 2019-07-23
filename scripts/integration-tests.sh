#!/usr/bin/env bash

# First this script will deploy from an instance of unlock:latest
REPO_ROOT=`dirname "$0"`/..
DOCKER_COMPOSE_FILE=$REPO_ROOT/docker/docker-compose.ci.yml
EXTRA_ARGS=$*

# set the environment variables needed for integration testing
eval "$($REPO_ROOT/scripts/set-integration-tests-env-variables.sh)"

mkdir -p /tmp/screenshots
chmod 0777 /tmp/screenshots

# Deploy the smart contract
docker-compose -f $DOCKER_COMPOSE_FILE build ganache-integration

# And then run the integration tests
COMMAND="npm run ci"
docker-compose -f $DOCKER_COMPOSE_FILE run -v /tmp/screenshots:/screenshots $EXTRA_ARGS integration-tests bash -c "$COMMAND"
