#!/usr/bin/env bash

# Script fails if any command fails
set -e

# This script deploys a static build to fleek.

APP_PATH=$1
DEPLOY_ENV=$2 #ignored in this script since unlock-protocol.com is always deployed to production
COMMIT=$3
PUBLISH=$4

# unlock-protocol.com is always deployed to production
DEPLOY_ENV="prod"

if [ "$PUBLISH" = "true" ]; then
  MESSAGE="Deploying $COMMIT to production. See logs below."
fi
# Package
UNLOCK_ENV="$DEPLOY_ENV" yarn deploy
# And ship!
echo $MESSAGE
npx -y @fleekhq/fleek-cli site:deploy
