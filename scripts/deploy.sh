#!/usr/bin/env bash

# This script invokes the deployment script for the service (first arg), to the target (second arg).
set -e

ENV_TARGET=${1:-staging} # defaults to staging
SERVICE=$2
TARGET=$3
COMMIT=$4
BRANCH=$5
IS_FORKED_PR=$6
REPO_ROOT=`dirname "$0"`/..
BASE_DOCKER_COMPOSE=$REPO_ROOT/docker/docker-compose.yml
DOCKER_COMPOSE_FILE=$REPO_ROOT/docker/docker-compose.ci.yml

NPM_SCRIPT="yarn workspace @unlock-protocol/$SERVICE deploy-$TARGET"

# Setting the right env var
export UNLOCK_ENV=$ENV_TARGET

if [ "$IS_FORKED_PR" = "true" ]; then
  echo "Skipping deployment because this is a pull request from a forked repository."
  exit 0
fi

# For staging deploys we pass all environment variables which start with STAGING_ and for production
# deploys we pass all environment variables which start with PROD_. We also remove the prefix so that
# the deploy script is identical in both cases
ENV_PREFIX="STAGING_"
if [ "$ENV_TARGET" = "prod" ]; then
  ENV_PREFIX="PROD_"
fi

# Custom variables passed for the target
# The convention is to name the environment variables starting with the UPPERCASE version of the $TARGET,
# then the $TARGET and finally $ENV_TARGET.
# For example: UNLOCK_APP_NETLIFY_STAGING_SITE_ID will be passed as SITE_ID
UPCASE_SERVICE="${SERVICE^^}"
TARGET_PREFIX="${UPCASE_SERVICE//-/_}_${TARGET^^}_$ENV_PREFIX"
ENV_VARS=`env | grep "^$TARGET_PREFIX" | awk '{print "-e ",$1}' ORS=' ' | sed -e "s/$TARGET_PREFIX//g"`

# PUBLISH: whether to publish/promote the deployed version
PUBLISH="false"
if [ "$BRANCH" = "master" ]; then
  PUBLISH="true"
fi

# Deploy options
OPTS="$SERVICE $ENV_TARGET $COMMIT $PUBLISH"

# First we need to build
docker-compose -f $BASE_DOCKER_COMPOSE -f $DOCKER_COMPOSE_FILE build $SERVICE

# Run deploy code!
docker-compose -f $BASE_DOCKER_COMPOSE -f $DOCKER_COMPOSE_FILE run $ENV_VARS -e UNLOCK_ENV=$ENV_TARGET $SERVICE $NPM_SCRIPT $OPTS
