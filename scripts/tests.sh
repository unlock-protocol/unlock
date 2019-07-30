#!/usr/bin/env bash

# this script runs the test in the service provided as first argument

SERVICE=$1
REPO_ROOT=`dirname "$0"`/..
DOCKER_COMPOSE_FILE=$REPO_ROOT/docker/docker-compose.ci.yml
COMMAND="npm run ci"

# We pass only the relevent env vars, which are prefixed with the service name, uppercased
# UNLOCK_APP_X will be passed to the container for tests in unlock_app as X.
UPCASE_SERVICE="${SERVICE^^}"
ENV_VARS_PREFIX="${UPCASE_SERVICE//-/_}_"
ENV_VARS=`env | grep $ENV_VARS_PREFIX | awk '{print "-e ",$1}' ORS=' ' | sed -e "s/$ENV_VARS_PREFIX//g"`


docker-compose -f $DOCKER_COMPOSE_FILE build ganache-integration

docker-compose -f $DOCKER_COMPOSE_FILE run -e CI=true $ENV_VARS $SERVICE $COMMAND
