#!/usr/bin/env bash
set -e

# this script runs the test in the service provided as first argument

SERVICE=$1
REPO_ROOT=$(dirname "$0")/..
BASE_DOCKER_COMPOSE=$REPO_ROOT/docker/docker-compose.yml
DOCKER_COMPOSE_FILE=$REPO_ROOT/docker/docker-compose.ci.yml

UNLOCK_SERVICE_NAME="${SERVICE/packages\//}"
PACKAGE_JSON_PATH="$REPO_ROOT/$SERVICE/package.json"
if [ ! -f "$PACKAGE_JSON_PATH" ]; then
  echo "No package.json found for $SERVICE at $PACKAGE_JSON_PATH"
  exit 1
fi

WORKSPACE_NAME=$(node -e "console.log(require(process.argv[1]).name)" "$PACKAGE_JSON_PATH")
COMMAND="yarn workspace $WORKSPACE_NAME run ci"

# Setting the right env var
export UNLOCK_ENV=test

# We pass only the relevent env vars, which are prefixed with the service name, uppercased
# UNLOCK_APP_X will be passed to the container for tests in unlock_app as X.
UPCASE_SERVICE="${UNLOCK_SERVICE_NAME^^}"
ENV_VARS_PREFIX="${UPCASE_SERVICE//-/_}_"
ENV_VARS=$(env | grep "^$ENV_VARS_PREFIX" | awk '{print "-e ",$1}' ORS=' ' | sed -e "s/$ENV_VARS_PREFIX//g")

# First we need to build the base
docker compose -f $BASE_DOCKER_COMPOSE -f $DOCKER_COMPOSE_FILE build $UNLOCK_SERVICE_NAME

# Run tests
docker compose -f $BASE_DOCKER_COMPOSE -f $DOCKER_COMPOSE_FILE run -e CI=true $ENV_VARS $UNLOCK_SERVICE_NAME $COMMAND
