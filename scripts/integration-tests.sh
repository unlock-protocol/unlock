#!/usr/bin/env bash

export DB_USERNAME='locksmith_test'
export DB_PASSWORD='password'
export DB_NAME='locksmith_test'
export DB_HOSTNAME='db'
export CI=true
export HTTP_PROVIDER='ganache-integration'
export LOCKSMITH_URI='http://locksmith:8080'
export PAYWALL_URL='http://paywall:3001'
export PAYWALL_SCRIPT_URL='http://paywall:3001/static/paywall.min.js'

# First this script will deploy from an instance of unlock:latest
REPO_ROOT=`dirname "$0"`/..
DOCKER_COMPOSE_FILE=$REPO_ROOT/docker/docker-compose.ci.yml
EXTRA_ARGS=$*

# Run the tests
COMMAND="npm run ci"

mkdir -p /tmp/screenshots
chmod 0777 /tmp/screenshots

docker-compose -f $DOCKER_COMPOSE_FILE run -v /tmp/screenshots:/screenshots $EXTRA_ARGS integration-tests bash -c "$COMMAND"
