#!/usr/bin/env bash

# Script fails if any command fails
set -e

# This script deploys a static build to netlify.
# It requires AUTH_TOKEN and SITE_ID to be set (see details on how to set them using deploy.sh)

APP_PATH=$1
DEPLOY_ENV=$2
COMMIT=$3
PUBLISH=$4
BUILD_PATH="build";
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

if [ -n "$SITE_ID" ] && [ -n "$AUTH_TOKEN" ]; then
  # Build
  UNLOCK_ENV="$DEPLOY_ENV" yarn build;
  echo $MESSAGE
  npx -y netlify-cli deploy --build --prod -s $SITE_ID -a $AUTH_TOKEN --dir=$STATIC_PATH --functions=$BUILD_PATH $PROD --message="$MESSAGE"
else
  echo "Failed to deploy to Netlify because we're missing SITE_ID and/or AUTH_TOKEN"
  exit 1
fi
