#!/usr/bin/env bash

# This script saves previously built images to docker hub on AWS.
# This should only run on master merges

IMAGE_NAME=$1
ARGS=""

if [ "$TRAVIS_BRANCH" = "master" ] && [ "$TRAVIS_PULL_REQUEST" = "false" ]; then
  if [ "$DOCKER_REPOSITORY" != "" ]; then
    aws sts get-caller-identity
    if [ $? -eq 0 ]; then
      IMAGE_CACHE="$DOCKER_REPOSITORY/$IMAGE_NAME:latest"
      docker tag "$IMAGE_NAME:latest" $IMAGE_CACHE;
      docker push $IMAGE_CACHE;
    fi
  fi
fi