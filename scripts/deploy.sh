#!/usr/bin/env bash

# This script invokes the deployment script for the target (as first arg) inside the default docker
# image by copying all the Travis env variables inside the docker image
# The second argument indicates if the build is for staging or production

TARGET=$1
COMMIT=$2
TAG=$3
BRANCH=$4
IS_PULL_REQUEST=$5
ENV_TARGET="staging"
NPM_SCRIPT="npm run deploy-$TARGET"
SERVICE="unlock"
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
if [ "$TARGET" = "prod" ]; then
  ENV_PREFIX="PROD_"
fi

# Extracting environment variables
DEPLOYMENT_ENV_VARS=`env | grep $ENV_PREFIX | awk '{print "-e ",$1}' ORS=' ' | sed -e "s/$ENV_PREFIX//g"`
ENV_VARS="$DEPLOYMENT_ENV_VARS"

## Custom variables passed for netlify
if [ "$TARGET" = "netlify" ]; then
  ENV_VARS="$ENV_VARS -e NETLIFY_AUTH_TOKEN=$NETLIFY_AUTH_TOKEN"
fi

# PUBLISH: whether to publish/promote the deployed version
PUBLISH="false"
if [ "$BRANCH" = "master" ] && [ "$IS_PULL_REQUEST" = "false" ]; then
  PUBLISH="true"
fi

# Deploy options
OPTS="$ENV_TARGET $COMMIT $PUBLISH"

docker-compose -f $DOCKER_COMPOSE_FILE run $ENV_VARS $SERVICE $NPM_SCRIPT -- $OPTS