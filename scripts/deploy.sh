#!/usr/bin/env bash

# This script invokes the deployment script for the target (as first arg) inside the default docker
# image by copying all the Travis env variables inside the docker image
# The second argument indicates if the build is for staging or production

TARGET=$1
ENV_TARGET="staging"
NPM_SCRIPT="npm run deploy-$TARGET"
SERVICE="unlock"
REPO_ROOT=`dirname "$0"`/..
DOCKER_COMPOSE_FILE=$REPO_ROOT/docker/docker-compose.ci.yml
ENV_VARS=`env | grep TRAVIS_ | awk '{print "-e ",$1}' ORS=' '`

# Identify the environment for the target (production or staging)
if [ -n "$TRAVIS_TAG" ] &&
   [ -n "$TRAVIS_COMMIT" ] &&
   [ "$TRAVIS_PULL_REQUEST" = "false" ]; then
  # Check that the TRAVIS_COMMIT is actually on the master branch to avoid deploying tags which are not on master
  git config --replace-all remote.origin.fetch +refs/heads/*:refs/remotes/origin/*
  git fetch >> /dev/null
  git branch -r --contains $TRAVIS_COMMIT | grep 'master' >> /dev/null
  if [ $? -eq 0 ]; then
    # This is a tag build on master. We deploy to the main site!
    ENV_TARGET="prod"
  else
    echo "Skipping deployment because commit $TRAVIS_COMMIT for tag $TRAVIS_TAG is not on master"
    exit 0
  fi
else
  # This is a branch build. We deploy to the staging site
  ENV_TARGET="staging"
fi

## Custom variables passed for netlify
if [ "$TARGET" = "netlify" ]; then
  NETLIFY_SITE_ID=$NETLIFY_STAGING_SITE_ID
  if [ "$ENV_TARGET" = "prod" ]; then
    NETLIFY_SITE_ID=$NETLIFY_PROD_SITE_ID
  fi
  ENV_VARS="$ENV_VARS -e NETLIFY_SITE_ID=$NETLIFY_SITE_ID -e NETLIFY_AUTH_TOKEN=$NETLIFY_AUTH_TOKEN"
fi

docker-compose -f $DOCKER_COMPOSE_FILE run $ENV_VARS $SERVICE $NPM_SCRIPT -- $ENV_TARGET