#!/usr/bin/env bash

# This script builds the corresponding images
# The argument is the image name

IMAGE_NAME=$1
REPO_ROOT=`dirname "$0"`/..
DOCKERFILE=$REPO_ROOT/docker/$IMAGE_NAME.dockerfile
ARGS=""
DOCKER_REPOSITORY="unlockprotocol"
CACHED_IMAGE_TAG="master"
SKIP_CORE=$2

if [ "$SKIP_CORE" != "true" ]; then
  echo "Pulling $DOCKER_REPOSITORY/unlock-core:$CACHED_IMAGE_TAG to use as cache for unlock-core"
  docker pull "$DOCKER_REPOSITORY/unlock-core:master" &
fi

IMAGE_CACHE="$DOCKER_REPOSITORY/$IMAGE_NAME:$CACHED_IMAGE_TAG"
echo "Pulling $IMAGE_CACHE to use as cache for $IMAGE_NAME"
docker pull $IMAGE_CACHE &
wait

if [ "$SKIP_CORE" != "true" ]; then
  # Then build unlock-core (it will most often be 100% cached as it should rarely change from master)
  ARGS="--cache-from $DOCKER_REPOSITORY/unlock-core:master"
  docker build -t unlock-core -f $REPO_ROOT/docker/unlock-core.dockerfile $ARGS $REPO_ROOT
fi

ARGS="--cache-from $IMAGE_CACHE"
docker build -t $IMAGE_NAME -f $DOCKERFILE $ARGS $REPO_ROOT
