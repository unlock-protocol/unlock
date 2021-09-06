#!/usr/bin/env bash
set -e

# this script runs the test in the service provided as first argument

SERVICE=$1
REPO_ROOT=`dirname "$0"`/..
BASE_DOCKER_COMPOSE=$REPO_ROOT/docker/docker-compose.yml
DOCKER_COMPOSE_FILE=$REPO_ROOT/docker/docker-compose.ci.yml

if [ "$SERVICE" = "unlock-protocol-com" ] ; then
    # need to replace "unlock-protocol-com" to dotcom
    COMMAND="yarn workspace @unlock-protocol/unlock-protocol.com run ci"
else 
    COMMAND="yarn workspace @unlock-protocol/$SERVICE run ci"
fi

# Setting the right env var
export UNLOCK_ENV=test

# We pass only the relevent env vars, which are prefixed with the service name, uppercased
# UNLOCK_APP_X will be passed to the container for tests in unlock_app as X.
UPCASE_SERVICE="${SERVICE^^}"
ENV_VARS_PREFIX="${UPCASE_SERVICE//-/_}_"
ENV_VARS=`env | grep "^$ENV_VARS_PREFIX" | awk '{print "-e ",$1}' ORS=' ' | sed -e "s/$ENV_VARS_PREFIX//g"`

# First we need to build the base
docker-compose -f $BASE_DOCKER_COMPOSE -f $DOCKER_COMPOSE_FILE build $SERVICE

# Run tests
docker-compose -f $BASE_DOCKER_COMPOSE -f $DOCKER_COMPOSE_FILE run -e CI=true $ENV_VARS $SERVICE $COMMAND
