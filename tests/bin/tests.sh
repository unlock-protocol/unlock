#!/usr/bin/env bash
REPO_ROOT=`dirname "$0"`/../..

# Setting the right env var
export UNLOCK_ENV=test

sh -c "$REPO_ROOT/scripts/run-stack-dockerized.sh"

# Run the integration tests if needed
if [ "$1" = 'run' ]
then
  echo "Running integration tests \n"
  COMMAND="yarn workspace tests test --network docker"
  docker-compose $COMPOSE_CONFIG build integration-tests
  docker-compose $COMPOSE_CONFIG run -e UNLOCK_ENV=test -e CI=true $EXTRA_ARGS integration-tests bash -c "$COMMAND"
fi