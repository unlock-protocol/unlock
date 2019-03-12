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

# set the environment variables needed to build with cache
# without these, the build will be incorrect and never hit cache
. $REPO_ROOT/scripts/integration-envs.sh

# if the integration test images are running, this ensures we remove any state
# prior to attempting to run the tests. This line is critical!
docker-compose -f $DOCKER_COMPOSE_FILE down --volumes

# re-build the images. This will use local docker cache
docker build -t unlock -f "$REPO_ROOT/docker/unlock.dockerfile" $REPO_ROOT
docker build -t unlock-integration -f "$REPO_ROOT/docker/unlock-integration.dockerfile" $REPO_ROOT

$REPO_ROOT/scripts/integration-tests.sh
