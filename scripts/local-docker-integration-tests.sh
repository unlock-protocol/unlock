#!/usr/bin/env bash
# This script is only used locally. It runs the integration tests in the same environment
# that they are run in when running on the CI server.
# The only dependency is on docker, everything else happens inside the containers
# usage:
#
# scripts/local-docker-integration-tests.sh

# First this script will deploy from an instance of unlock:latest
REPO_ROOT=`dirname "$0"`/..
DOCKER_COMPOSE_FILE=$REPO_ROOT/docker/docker-compose.ci.yml
EXTRA_ARGS=$*

# set the environment variables needed for integration testing
eval "$($REPO_ROOT/scripts/set-integration-tests-env-variables.sh)"

# if the integration test images are running, this ensures we remove any state
# prior to attempting to run the tests. This line is critical!
docker-compose -f $DOCKER_COMPOSE_FILE down

# re-build the images. This will use local docker cache
# and because we source the script, it will inherit our environment variables
(. $REPO_ROOT/scripts/docker-compose-build.sh)

# Run the tests
$REPO_ROOT/scripts/integration-tests.sh $EXTRA_ARGS

