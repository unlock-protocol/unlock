#!/usr/bin/env bash

# This script deploys a static build to netlify.
# It requires NETLIFY_AUTH_TOKEN to be set, as well as
# TRAVIS_BRANCH to identify whether we deploy a 'draft' or a 'production' version (note that this
# is production in the netlify sense, so it could be on staging.unlock-protocol.com).


CURRENT_DIR=`pwd`;
UNLOCK_APP_PATH="unlock-app";
BUILD_PATH="$UNLOCK_APP_PATH/src/out/";

GIT_HEAD=`git rev-parse HEAD`;

if [ -n "$TRAVIS_TAG" ] &&
   [ "$TRAVIS_BRANCH" = "master" ] &&
   [ "$TRAVIS_PULL_REQUEST" = "false" ]; then
  # This is a tag build on master. We deploy to the main site!
  DEPLOY_ENV="prod";
  NETLIFY_SITE_ID="$NETLIFY_PROD_SITE_ID"
  PROD="--prod";
  MESSAGE="Deploying version $TRAVIS_TAG to production";
else
  # This is a branch build. We deploy to the staging site
  DEPLOY_ENV="staging"
  NETLIFY_SITE_ID="$NETLIFY_STAGING_SITE_ID"

  if [ "$TRAVIS_BRANCH" = "master" ] && [ "$TRAVIS_PULL_REQUEST" = "false" ]; then
    # This is a build on master, we deploy to staging as a published build
    PROD="--prod";
    MESSAGE="Deploying $GIT_HEAD to production";
  else
    # we deploy as a draft on staging
    PROD="";
    MESSAGE="Deploying $GIT_HEAD to draft";
  fi
fi

if [ -n "$NETLIFY_SITE_ID" ] && [ -n "$NETLIFY_AUTH_TOKEN" ]; then
  cd $UNLOCK_APP_PATH;
  UNLOCK_ENV="$DEPLOY_ENV" npm run deploy;
  cd $CURRENT_DIR
  echo $MESSAGE
  netlify deploy -s $NETLIFY_SITE_ID --dir=$BUILD_PATH $PROD --message='$MESSAGE'
else
  echo "Skipping deployment to Netlify"
fi

