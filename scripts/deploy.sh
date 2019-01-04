#!/usr/bin/env bash

# This script deploys a static build to netlify.
# It requires both NETLIFY_STAGING_SITE_ID and NETLIFY_AUTH_TOKEN to be set, as well as
# TRAVIS_BRANCH to identify whether we deploy a 'draft' or a 'production' version (note that this
# is production in the netlify sense, so it could be on staging.unlock-protocol.com).

CURRENT_DIR=`pwd`;

UNLOCK_APP_PATH="unlock-app";

cd $UNLOCK_APP_PATH;

UNLOCK_ENV=staging npm run deploy;

cd $CURRENT_DIR

BUILD_PATH="$UNLOCK_APP_PATH/src/out/";

GIT_HEAD=`git rev-parse HEAD`;

MESSAGE="Deploying $GIT_HEAD to draft";

PROD="";

if [ "$TRAVIS_BRANCH" = "master" ] && [ "$TRAVIS_PULL_REQUEST" = "false" ]; then
  PROD="--prod";

  MESSAGE="Deploying $GIT_HEAD to production";
fi

echo $MESSAGE
netlify deploy -s $NETLIFY_STAGING_SITE_ID --dir=$BUILD_PATH $PROD --message='$MESSAGE'