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

# environment variables passed in. Update as needed for testing
export CI=true
export UNLOCK_ENV='test'
export DB_USERNAME='locksmith_test'
export DB_PASSWORD='password'
export DB_NAME='locksmith_test'
export DB_HOSTNAME='db'
export HTTP_PROVIDER='ganache-integration'
export LOCKSMITH_URI='http://locksmith:8080'
export PAYWALL_URL='http://unlock:3001'
export PAYWALL_SCRIPT_URL='http://unlock:3001/static/paywall.min.js'
export UNLOCK_STATIC_URL='http://unlock-protocol-com:3002'

# if the integration test images are running, this ensures we remove any state
# prior to attempting to run the tests. This line is critical!
docker-compose -f $DOCKER_COMPOSE_FILE down

# re-build the images. This will use local docker cache
docker build -t unlock-core -f "$REPO_ROOT/docker/unlock-core.dockerfile" $REPO_ROOT
docker build -t unlock-app -f "$REPO_ROOT/docker/unlock-app.dockerfile" $REPO_ROOT
docker build -t wedlocks -f "$REPO_ROOT/docker/wedlocks.dockerfile" $REPO_ROOT
docker build -t smart-contracts -f "$REPO_ROOT/docker/smart-contracts.dockerfile" $REPO_ROOT
docker build -t paywall -f "$REPO_ROOT/docker/paywall.dockerfile" $REPO_ROOT
docker build -t locksmith -f "$REPO_ROOT/docker/locksmith.dockerfile" $REPO_ROOT
docker build -t unlock-protocol-com -f "$REPO_ROOT/docker/unlock-protocol-com.dockerfile" $REPO_ROOT
docker build -t integration-tests -f "$REPO_ROOT/docker/integration-tests.dockerfile" $REPO_ROOT

# Run the tests
$REPO_ROOT/scripts/integration-tests.sh $EXTRA_ARGS

