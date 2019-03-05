#!/usr/bin/env bash

# This script invokes the deployment script for the service (first arg), to the target (second arg).


SERVICE=$1
TARGET=$2
COMMIT=$3
TAG=$4
BRANCH=$5
IS_PULL_REQUEST=$6
ENV_TARGET="staging"
NPM_SCRIPT="npm run deploy-$TARGET"
REPO_ROOT=`dirname "$0"`/..
DOCKER_COMPOSE_FILE=$REPO_ROOT/docker/docker-compose.ci.yml

# Identify the environment for the target (production or staging)
if [ -n "$TAG" ] &&
   [ -n "$COMMIT" ] &&
   [ "$IS_PULL_REQUEST" = "false" ]; then
  # Check that the COMMIT is actually on the master branch to avoid deploying tags which are not on master
  git config --replace-all remote.origin.fetch +refs/heads/*:refs/remotes/origin/*
  git fetch >> /dev/null
  git branch -r --contains $COMMIT | grep 'master' >> /dev/null
  if [ $? -eq 0 ]; then
    # This is a tag build on master. We deploy to the main site!
    ENV_TARGET="prod"
  else
    echo "Skipping deployment because commit $COMMIT for tag $TAG is not on master"
    exit 0
  fi
else
  # This is a branch build. We deploy to the staging site
  ENV_TARGET="staging"
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
ENV_VARS=`env | grep $TARGET_PREFIX | awk '{print "-e ",$1}' ORS=' ' | sed -e "s/$TARGET_PREFIX//g"`

# PUBLISH: whether to publish/promote the deployed version
PUBLISH="false"
if [ "$BRANCH" = "master" ] && [ "$IS_PULL_REQUEST" = "false" ]; then
  PUBLISH="true"
fi

# Deploy options
OPTS="$SERVICE $ENV_TARGET $COMMIT $PUBLISH"

docker-compose -f $DOCKER_COMPOSE_FILE run $ENV_VARS $SERVICE $NPM_SCRIPT -- $OPTS