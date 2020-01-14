#!/usr/bin/env bash

# First this script will deploy from an instance of unlock:latest
REPO_ROOT=`dirname "$0"`/..
BASE_DOCKER_COMPOSE=$REPO_ROOT/docker/docker-compose.yml
DOCKER_COMPOSE_FILE=$REPO_ROOT/docker/docker-compose.ci.yml
EXTRA_ARGS=$*

mkdir -p /tmp/screenshots
chmod 0777 /tmp/screenshots

# Deploy the subgraph
docker-compose -f $BASE_DOCKER_COMPOSE -f $DOCKER_COMPOSE_FILE up subgraph_deployment

# Deploy the smart contract
docker-compose -f $BASE_DOCKER_COMPOSE -f $DOCKER_COMPOSE_FILE build ganache-integration

# And then run the integration tests
COMMAND="yarn run ci"
docker-compose -f $BASE_DOCKER_COMPOSE -f $DOCKER_COMPOSE_FILE run -v /tmp/screenshots:/screenshots $EXTRA_ARGS integration-tests bash -c "$COMMAND"
