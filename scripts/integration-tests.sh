#!/usr/bin/env bash

# First this script will deploy from an instance of unlock:latest
REPO_ROOT=`dirname "$0"`/..
BASE_DOCKER_COMPOSE=$REPO_ROOT/docker/docker-compose.yml
DOCKER_COMPOSE_FILE=$REPO_ROOT/docker/docker-compose.ci.yml
EXTRA_ARGS=$*

COMPOSE_CONFIG="-f $BASE_DOCKER_COMPOSE -f $DOCKER_COMPOSE_FILE"

# Setting the right env var
export UNLOCK_ENV=test

mkdir -p /tmp/screenshots
chmod 0777 /tmp/screenshots

# Take cluster down to start "clean"
# TODO Let's make this optional via command line to make local dev easier

docker-compose $COMPOSE_CONFIG down

# Improvment:
# At this point, docker-compose will builds the images it needs for the cluster.
# However it does that in an not particularly smart way (no concurrency, no use of existing cache
# ...). In order to imporve this we could manually build the images we need using the speed
# improvments we want. We already have a script to build images with build-image.sh which should
# make that easy.

# start unlock-app to make sure it's built by the time the tests run
docker-compose $COMPOSE_CONFIG up --detach unlock-app
docker-compose $COMPOSE_CONFIG up --detach unlock-provider-unlock-app
docker-compose $COMPOSE_CONFIG up --detach paywall

# Deploy the subgraph
# TODO make the script idempotent so that it does not deploy twice!
docker-compose $COMPOSE_CONFIG up subgraph_deployment

# Deploy the smart contract
# TODO: make the script idempotent so that it does not deploy twice!
docker-compose $COMPOSE_CONFIG up ganache-standup

# And then run the integration tests
COMMAND="yarn run ci"
docker-compose $COMPOSE_CONFIG run -e UNLOCK_ENV=test -v /tmp/screenshots:/screenshots $EXTRA_ARGS integration-tests bash -c "$COMMAND"
