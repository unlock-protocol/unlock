
#!/usr/bin/env bash

set -e

# This script saves previously built images to docker hub or AWS.
# This should only run on $CIRCLE_BRANCH merges

IMAGES=( $@ )
TIMESTAMP=`date +%s` # TODO: remove? Do we need this?

IMAGE_TAG_LIST=( $CIRCLE_BRANCH latest $TIMESTAMP $CIRCLE_SHA1)

echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin


for IMAGE_NAME in "${IMAGES[@]}"
do

  for IMAGE_TAG in "${IMAGE_TAG_LIST[@]}"
  do
    IMAGE_TO_PUSH="$DOCKER_REPOSITORY/$IMAGE_NAME:$IMAGE_TAG"
    echo "Pushing $IMAGE_TO_PUSH"
    docker tag $IMAGE_NAME $IMAGE_TO_PUSH
    docker push $IMAGE_TO_PUSH
  done

done
wait
