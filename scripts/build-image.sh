#!/usr/bin/env bash

# This script builds the corresponding images
# The argument is the image name

IMAGE_NAME=$1
REPO_ROOT=`dirname "$0"`/..
DOCKERFILE=$REPO_ROOT/docker/$IMAGE_NAME.dockerfile
ARGS=""
DOCKER_REPOSITORY="unlockprotocol"
CACHED_IMAGE_TAG="master"
ENV_TARGET=$2
TARGET=$3

# We extract the env vars from CI using a PREFIX logic
# TODO: reconsider prefix based on TARGET : PROD should be PROD everywhere!
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
UPCASE_IMAGE_NAME="${IMAGE_NAME^^}"
TARGET_PREFIX="${UPCASE_IMAGE_NAME//-/_}_${TARGET^^}_$ENV_PREFIX"


BUILD_ARGS=`env | grep $TARGET_PREFIX | awk '{print "--build-arg ",$1}' ORS=' ' | sed -e "s/$TARGET_PREFIX//g"`

IMAGE_CACHE="$DOCKER_REPOSITORY/$IMAGE_NAME:$CACHED_IMAGE_TAG"
echo "Pulling $IMAGE_CACHE to use as cache for $IMAGE_NAME"
docker pull $IMAGE_CACHE

ARGS="--cache-from $IMAGE_CACHE"
docker build $BUILD_ARGS -t $IMAGE_NAME -f $DOCKERFILE $ARGS $REPO_ROOT
