#!/usr/bin/env bash

# This script invokes the deployment script for the target (as first arg) inside the default docker
# image by copying all the Travis env variables inside the docker image

TARGET=$1
NPM_SCRIPT="npm run deploy-$TARGET"
SERVICE="unlock"
REPO_ROOT=`dirname "$0"`/..
DOCKER_COMPOSE_FILE=$REPO_ROOT/docker/docker-compose.ci.yml
ENV_VARS=`env | grep TRAVIS_ | awk '{print "-e ",$1}' ORS=' '`

if [ "$TARGET" = "netlify" ]; then
  ENV_VARS="$ENV_VARS -e NETLIFY_STAGING_SITE_ID=$NETLIFY_STAGING_SITE_ID -e NETLIFY_AUTH_TOKEN=$NETLIFY_AUTH_TOKEN"
fi

docker-compose -f $DOCKER_COMPOSE_FILE run $ENV_VARS $SERVICE $NPM_SCRIPT