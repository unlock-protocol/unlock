#!/usr/bin/env bash

# First this script will deploy from an instance of unlock:latest
REPO_ROOT=`dirname "$0"`/..
DOCKER_COMPOSE_FILE=$REPO_ROOT/docker/docker-compose.ci.yml
COMMAND="cd smart-contracts && npm run deploy -- --network test"
docker-compose -f $DOCKER_COMPOSE_FILE run -e CI=true unlock bash -c "$COMMAND"

# Then it will run the integration tests
COMMAND="npm run ci"
docker-compose -f $DOCKER_COMPOSE_FILE run -e CI=true integration-tests $COMMAND
