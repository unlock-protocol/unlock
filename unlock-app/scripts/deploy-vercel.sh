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

if [ -n "$VERCEL_TOKEN" ]; then
  # And ship!
  export UNLOCK_ENV="$DEPLOY_ENV" 
  npx -y vercel build -y --cwd . --token $VERCEL_TOKEN $PROD
  npx -y vercel deploy --cwd . --prebuilt --token $VERCEL_TOKEN $PROD
else
  echo "Failed to deploy to Vercel because we're missing VERCEL_TOKEN"
  exit 1
fi
