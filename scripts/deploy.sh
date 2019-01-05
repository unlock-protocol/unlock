#!/usr/bin/env bash

# This script invokes the deployment script for the target (as first arg) inside the default docker
# image. Default env variables are passed: $TRAVIS_PULL_REQUEST and $TRAVIS_BRANCH

TARGET=$1
NPM_SCRIPT="npm run deploy-$TARGET"
SERVICE="unlock"
REPO_ROOT=`dirname "$0"`/..
DOCKER_COMPOSE_FILE=$REPO_ROOT/docker/docker-compose.ci.yml
ENV_VARS="-e TRAVIS_PULL_REQUEST=$TRAVIS_PULL_REQUEST -e TRAVIS_BRANCH=$TRAVIS_BRANCH"

if [ "$TARGET" = "netlify" ]; then
  ENV_VARS="$ENV_VARS -e NETLIFY_STAGING_SITE_ID=$NETLIFY_STAGING_SITE_ID -e NETLIFY_AUTH_TOKEN=$NETLIFY_AUTH_TOKEN"
fi

docker-compose -f $DOCKER_COMPOSE_FILE run $ENV_VARS $SERVICE $NPM_SCRIPT