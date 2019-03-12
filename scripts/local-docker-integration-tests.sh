#!/usr/bin/env bash


# First this script will deploy from an instance of unlock:latest
REPO_ROOT=`dirname "$0"`/..
DOCKER_COMPOSE_FILE=$REPO_ROOT/docker/docker-compose.ci.yml

# environment variables passed in. Update as needed for testing
export DB_USERNAME='username'
export DB_PASSWORD='password'
export DB_NAME='locksmith'
export DB_HOSTNAME='db'
export CI=true
export HTTP_PROVIDER='ganache-integration'
export LOCKSMITH_URI='http://locksmith:8080'
export PAYWALL_URL=http://unlock:3000/paywall
export PAYWALL_SCRIPT_URL=http://unlock:3000/static/paywall.min.js

# if the integration test images are running, this ensures we remove any state
# prior to attempting to run the tests. This line is critical!
docker-compose -f $DOCKER_COMPOSE_FILE down --volumes

# re-build the images. This will use local docker cache
docker build -t unlock -f "$REPO_ROOT/docker/unlock.dockerfile" $REPO_ROOT
docker build -t unlock-integration -f "$REPO_ROOT/docker/unlock-integration.dockerfile" $REPO_ROOT

# Run the tests
COMMAND="npm run ci"
docker-compose -f $DOCKER_COMPOSE_FILE run integration-tests bash -c "$COMMAND" 

