#!/usr/bin/env bash

# Script fails if any command fails
set -e

# This script deploys a static build to netlify.
# It requires AUTH_TOKEN and SITE_ID to be set (see details on how to set them using deploy.sh)

APP_PATH=$1
DEPLOY_ENV=$2 #ignored in this script since unlock-protocol.com is always deployed to production
COMMIT=$3
PUBLISH=$4
BUILD_PATH="out/";

if [ "$PUBLISH" = "true" ]; then
  # This is a build on master, we deploy to staging as a published build
  PROD="--prod";
  MESSAGE="Deploying $COMMIT to production. See logs below.";
else
  # we deploy as a draft on staging
  PROD="";
  MESSAGE="Deploying $COMMIT to draft. See draft URL and logs below.";
fi

if [ -n "$SITE_ID" ] && [ -n "$AUTH_TOKEN" ]; then
  # Package
  UNLOCK_ENV=prod npm run deploy;
  # And ship!
  echo $MESSAGE
  netlify deploy -s $SITE_ID -a $AUTH_TOKEN --dir=$BUILD_PATH $PROD --message="$MESSAGE"
else
  echo "Failed to deploy to Netlify because we're missing SITE_ID and/or AUTH_TOKEN"
  exit 1
fi
