
#!/usr/bin/env bash

# This script saves previously built images to docker hub or AWS.
# This should only run on master merges

IMAGES=( $@ )
TIMESTAMP=`date +%s`

IMAGE_TAG_LIST=( master latest $TIMESTAMP)

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
