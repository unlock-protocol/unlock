#!/usr/bin/env bash

# Script fails if any command fails
set -e

# This script deploys a static build to fleek.

APP_PATH=$1
DEPLOY_ENV=$2 # Ignored because only deploying to production right now
COMMIT=$3
PUBLISH=$4

if [ "$PUBLISH" = "true" ]; then
  MESSAGE="Deploying $COMMIT to production. See logs below.";
fi
  # rebuild
  UNLOCK_ENV="$DEPLOY_ENV" yarn build;
  # Package
  UNLOCK_ENV="$DEPLOY_ENV" yarn deploy;
  # And ship!
  echo $MESSAGE
  npx @fleekhq/fleek-cli site:deploy
fi
