#!/usr/bin/env bash

# This script deploys a static build to netlify.
# It requires NETLIFY_AUTH_TOKEN to be set, as well as
# TRAVIS_BRANCH to identify whether we deploy a 'draft' or a 'production' version (note that this
# is production in the netlify sense, so it could be on staging.unlock-protocol.com).


CURRENT_DIR=`pwd`;
UNLOCK_APP_PATH="unlock-app";
BUILD_PATH="$UNLOCK_APP_PATH/src/out/";


if [ -n "$TRAVIS_TAG" ] &&
   [ -n "$TRAVIS_COMMIT" ] &&
   [ "$TRAVIS_PULL_REQUEST" = "false" ]; then
  # Check that the TRAVIS_COMMIT is actually on the master branch [to avoid deploying tags which are not on master]
  git branch --contains $TRAVIS_COMMIT | grep 'master' >> /dev/null
  if [ $? -eq 0 ]; then
    # This is a tag build on master. We deploy to the main site!
    DEPLOY_ENV="prod";
    NETLIFY_SITE_ID="$NETLIFY_PROD_SITE_ID"
    PROD="--prod";
    MESSAGE="Deploying version $TRAVIS_TAG to production";
  else
    echo "Skipping deployment on Netlify because commit $TRAVIS_COMMIT for tag $TRAVIS_TAG is not on master"
    exit 0
  fi
else
  # This is a branch build. We deploy to the staging site
  DEPLOY_ENV="staging"
  NETLIFY_SITE_ID="$NETLIFY_STAGING_SITE_ID"

  if [ "$TRAVIS_BRANCH" = "master" ] && [ "$TRAVIS_PULL_REQUEST" = "false" ]; then
    # This is a build on master, we deploy to staging as a published build
    PROD="--prod";
    MESSAGE="Deploying $TRAVIS_COMMIT to production";
  else
    # we deploy as a draft on staging
    PROD="";
    MESSAGE="Deploying $TRAVIS_COMMIT to draft";
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

