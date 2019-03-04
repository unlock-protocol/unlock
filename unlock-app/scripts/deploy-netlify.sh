#!/usr/bin/env bash

# This script deploys a static build to netlify.
# It requires NETLIFY_AUTH_TOKEN to be set, as well as
# is production in the netlify sense, so it could be on staging.unlock-protocol.com).

APP_PATH=$1
DEPLOY_ENV=$2
COMMIT=$3
PUBLISH=$4
BUILD_PATH="out/";

if [ "$DEPLOY_ENV" = "staging" ]; then
  if [ "$PUBLISH" = "true" ]; then
    # This is a build on master, we deploy to staging as a published build
    PROD="--prod";
    MESSAGE="Deploying $COMMIT to staging. See logs below.";
  else
    # we deploy as a draft on staging
    PROD="";
    MESSAGE="Deploying $COMMIT to draft. See draft URL and logs below.";
  fi
fi

if [ "$DEPLOY_ENV" = "prod" ]; then
  PROD="--prod";
  MESSAGE="Deploying version $COMMIT to production";
fi

if [ -n "$NETLIFY_SITE_ID" ] && [ -n "$NETLIFY_AUTH_TOKEN" ]; then
  UNLOCK_ENV="$DEPLOY_ENV" npm run deploy;

  echo $MESSAGE
  netlify deploy -s $NETLIFY_SITE_ID --dir=$BUILD_PATH $PROD --message='$MESSAGE'
else
  echo "Skipping deployment to Netlify ($NETLIFY_SITE_ID)"
fi
