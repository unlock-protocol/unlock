
#!/usr/bin/env bash

# This script saves previously built images to docker hub or AWS.
# This should only run on master merges

IMAGE_NAME=$1
IMAGE_TAG=master

echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin

IMAGES=( unlock-core paywall smart-contracts unlock-app locksmith integration-tests wedlocks unlock-protocol-com )

for IMAGE_NAME in "${IMAGES[@]}"
do
  IMAGE_TO_PUSH="$DOCKER_REPOSITORY/$IMAGE_NAME:$IMAGE_TAG"
  docker tag $IMAGE_NAME $IMAGE_TO_PUSH
  docker push $IMAGE_TO_PUSH &
done

wait
