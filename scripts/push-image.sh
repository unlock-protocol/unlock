#!/usr/bin/env bash

# This script saves previously built images to docker hub on AWS.
# This should only run on master merges

IMAGE_NAME=$1
IMAGE_TAG=$2

echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
IMAGE_TO_PUSH="$DOCKER_REPOSITORY/$IMAGE_NAME:$IMAGE_TAG"
docker tag $IMAGE_NAME $IMAGE_TO_PUSH
docker push $IMAGE_TO_PUSH

