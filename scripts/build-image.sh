#!/usr/bin/env bash

# This script builds the corresponding images
# The argument is the image name
# When a DOCKER_REPOSITORY is available we will first pull it from AWS where the cached images are stored

IMAGE_NAME=$1
REPO_ROOT=`dirname "$0"`/..
DOCKERFILE=$REPO_ROOT/docker/$IMAGE_NAME.dockerfile
ARGS=""

if [ "$DOCKER_REPOSITORY" != "" ]; then
  if [ -n "$AWS_ENABLED" ]; then

    IMAGE_CACHE="$DOCKER_REPOSITORY/$IMAGE_NAME:latest"
    docker pull $IMAGE_CACHE;
    ARGS="$ARGS --cache-from $IMAGE_CACHE"
  fi
fi

docker build -t $IMAGE_NAME -f $DOCKERFILE $ARGS $REPO_ROOT
