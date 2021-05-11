#!/usr/bin/env bash

# This script invokes the deployment script for the service (first arg), to the target (second arg).

ENV_TARGET=${1:-staging} # defaults to staging
SERVICE=$2
COMMIT=$3
BRANCH=$4
IS_FORKED_PR=$5
REPO_ROOT=`dirname "$0"`/..
BASE_DOCKER_COMPOSE=$REPO_ROOT/docker/docker-compose.yml
DOCKER_COMPOSE_FILE=$REPO_ROOT/docker/docker-compose.ci.yml

# Setting the right env var
export UNLOCK_ENV=$ENV_TARGET


if [ "$IS_FORKED_PR" = "true" ]; then
  echo "Skipping deployment because this is a pull request from a forked repository."
  exit 0
fi

if [ ! "$BRANCH" = "master" ]; then
  echo "We only deploy to AWS on master!"
  exit 0
fi

# 1. let's get the env variables needed to build!

# For staging deploys we pass all environment variables which start with STAGING_ and for production
# deploys we pass all environment variables which start with PROD_. We also remove the prefix so that
# the deploy script is identical in both cases
ENV_PREFIX="STAGING_"
if [ "$ENV_TARGET" = "prod" ]; then
  ENV_PREFIX="PROD_"
fi

# Custom variables passed for the target
# The convention is to name the environment variables starting with the UPPERCASE version of the $TARGET,
# then the $TARGET and finally $ENV_TARGET.
# For example: UNLOCK_APP_NETLIFY_STAGING_SITE_ID will be passed as SITE_ID
UPCASE_SERVICE="${SERVICE^^}"
TARGET_PREFIX="${UPCASE_SERVICE//-/_}_${TARGET^^}_$ENV_PREFIX"
ENV_VARS=`env | grep "^$TARGET_PREFIX" | awk '{print "-e ",$1}' ORS=' ' | sed -e "s/$TARGET_PREFIX//g"`

NPM_SCRIPT="yarn deploy"

docker-compose -f $BASE_DOCKER_COMPOSE -f $DOCKER_COMPOSE_FILE run $ENV_VARS -e UNLOCK_ENV=prod $SERVICE $NPM_SCRIPT
docker cp `docker ps -alq`:/home/unlock/$SERVICE/out .

BUCKET_NAME_VAR="${UPCASE_SERVICE//-/_}_${ENV_PREFIX}BUCKET_NAME"
DISTRIBUTION_ID_VAR="${UPCASE_SERVICE//-/_}_${ENV_PREFIX}DISTRIBUTION_ID"

BUCKET_NAME="${!BUCKET_NAME_VAR}"
DISTRIBUTION_ID="${!DISTRIBUTION_ID_VAR}"
if [ -n "$AWS_ACCESS_KEY_ID" ] && [ -n "$AWS_SECRET_ACCESS_KEY" ]; then
  # Install aws cli w/o sudo
  pip install --user awscli;

  # Put aws in the path
  export PATH=$PATH:$HOME/.local/bin;

  # log in
  eval $(aws ecr get-login --no-include-email --region us-east-1);

  # Then, add to S3!
  aws s3 sync out/ s3://$BUCKET_NAME

  # Add website config
  aws s3api put-bucket-website --bucket $BUCKET_NAME --website-configuration file://out/s3config.json

  # Invalidate Cloudfront Distribution
  aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*"
else
  echo "Missing AWS config"
fi
