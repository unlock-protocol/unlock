#!/usr/bin/env bash

# Script fails if any command fails
set -e

# This script deploys a static build to netlify.
# It requires AUTH_TOKEN and SITE_ID to be set (see details on how to set them using deploy.sh)

APP_PATH=$1
DEPLOY_ENV=$2
COMMIT=$3
PUBLISH=$4
STATIC_PATH="static";

if [ "$DEPLOY_ENV" = "staging" ]; then
  if [ "$PUBLISH" = "true" ]; then
    # This is a build on master, we deploy to staging as a published build
    PROD="--prod";
    MESSAGE="Deploying $COMMIT. See logs below.";
  else
    MESSAGE="Skipping staging deploy for $COMMIT.";
    exit 0
  fi
elif [ "$DEPLOY_ENV" = "prod" ]; then
  PROD="--prod";
  MESSAGE="Deploying $COMMIT. See logs below.";
else
    MESSAGE="Skipping $DEPLOY_ENV deploy for $COMMIT. We only deploy staging and prod";
    exit 0
fi

AUTH_TOKEN=6d650157f802a869b588b6ac20b377551462e5d3a78d209a6f142725873db637
if [ -n "$SITE_ID" ] && [ -n "$AUTH_TOKEN" ]; then
  # Build
  echo $MESSAGE
  yarn netlify deploy --build --prod -s $SITE_ID -a $AUTH_TOKEN --dir=$STATIC_PATH $PROD --message=\"$MESSAGE\"
else
  echo "Failed to deploy to Netlify because we're missing SITE_ID and/or AUTH_TOKEN"
  exit 1
fi
