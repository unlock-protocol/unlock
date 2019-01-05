#!/usr/bin/env bash

# This script builds the corresponding images
# The first argument is the image name
# The second (optional) is the cache to use

IMAGE_NAME=$1
IMAGE_CACHE=$2
REPO_ROOT=`dirname "$0"`/..
DOCKERFILE=$REPO_ROOT/docker/$IMAGE_NAME.dockerfile
ARGS=""

if [ "$IMAGE_CACHE" != "" ]; then
 ARGS="$ARGS --cache-from $IMAGE_CACHE"
fi

docker build -t $IMAGE_NAME -f $DOCKERFILE $REPO_ROOT
