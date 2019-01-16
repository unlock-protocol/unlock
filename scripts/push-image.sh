#!/usr/bin/env bash

# This script saves previously built images to docker hub on AWS.
# This should only run on master merges

IMAGE_NAME=$1
ARGS=""

if [ "$DOCKER_REPOSITORY" != "" ]; then
  if [ -n "$AWS_ENABLED" ]; then
    IMAGE_CACHE="$DOCKER_REPOSITORY/$IMAGE_NAME:latest"
    docker tag "$IMAGE_NAME:latest" $IMAGE_CACHE;
    docker push $IMAGE_CACHE;
  fi
fi

