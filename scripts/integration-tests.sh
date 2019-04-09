#!/usr/bin/env bash

# Here we set environment variables which will be used when running docker compose
# We are setting them globally so that they are used by the whole "cluster"

export CI=true
export UNLOCK_ENV='test'
export DB_USERNAME='locksmith_test'
export DB_PASSWORD='password'
export DB_NAME='locksmith_test'
export DB_HOSTNAME='db'
export HTTP_PROVIDER='ganache-integration'
export LOCKSMITH_URI='http://locksmith:8080'
export PAYWALL_URL='http://paywall:3001'
export PAYWALL_SCRIPT_URL='http://paywall:3001/static/paywall.min.js'
export UNLOCK_HOST='unlock-app'
export DASHBOARD_URL='http://unlock-app:3000'
export READ_ONLY_PROVIDER='http://ganache-integration:8545'

# First this script will deploy from an instance of unlock:latest
REPO_ROOT=`dirname "$0"`/..
DOCKER_COMPOSE_FILE=$REPO_ROOT/docker/docker-compose.ci.yml
EXTRA_ARGS=$*


mkdir -p /tmp/screenshots
chmod 0777 /tmp/screenshots

# Deploy the smart contract
COMMAND="npm run deploy-unlock-contract"
docker-compose -f $DOCKER_COMPOSE_FILE run -v /tmp/screenshots:/screenshots $EXTRA_ARGS unlock-contract-deployer bash -c "$COMMAND"

# And then run the integration tests
COMMAND="npm run ci"
docker-compose -f $DOCKER_COMPOSE_FILE run -v /tmp/screenshots:/screenshots $EXTRA_ARGS integration-tests bash -c "$COMMAND"
