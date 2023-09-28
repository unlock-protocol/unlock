#!/usr/bin/env bash

# Script fails if any command fails
set -e

# This script deploys a build to vercel.

APP_PATH=$1
DEPLOY_ENV=$2
COMMIT=$3
PUBLISH=$4

if [ "$DEPLOY_ENV" = "staging" ]; then
  if [ "$PUBLISH" = "true" ]; then
    # This is a build on master, we deploy to staging as a published build
    PROD="--prod"
  else
    # we deploy as a draft on staging
    PROD=""
  fi
fi

if [ "$DEPLOY_ENV" = "prod" ]; then
  PROD="--prod"
fi

echo "READY TO DEPLOY $APP_PATH $DEPLOY_ENV $PROD (commit $COMMIT)  TO VERCEL $VERCEL_PROJECT_ID $VERCEL_ORG_ID"

if [ -n "$VERCEL_PROJECT_ID" ] && [ -n "$VERCEL_TOKEN" ] && [ -n "$VERCEL_ORG_ID" ]; then
  # And ship!
  export UNLOCK_ENV="$DEPLOY_ENV"
  export NEXT_PUBLIC_UNLOCK_ENV="$DEPLOY_ENV"
  # move to root directory
  cd ..
  npx -y vercel build -y --cwd . --token $VERCEL_TOKEN $PROD
  npx -y vercel deploy --cwd . --prebuilt --token $VERCEL_TOKEN $PROD
else
  echo "Failed to deploy to Vercel because we're missing VERCEL_TOKEN, VERCEL_PROJECT_ID and/or VERCEL_ORG_ID"
  exit 1
fi
