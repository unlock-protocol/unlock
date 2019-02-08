#!/usr/bin/env bash

# This script saves previously built images to docker hub on AWS.
# This should only run on master merges

IMAGE_NAME=$1
ARGS=""

if [ "$TRAVIS_BRANCH" = "master" ] && [ "$TRAVIS_PULL_REQUEST" = "false" ]; then
  if [ "$DOCKER_REPOSITORY" != "" ]; then
    echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
    IMAGE_CACHE="$DOCKER_REPOSITORY/$IMAGE_NAME:latest"
    docker tag "$IMAGE_NAME:latest" $IMAGE_CACHE
    docker push $IMAGE_CACHE
  fi
fi
