#!/usr/bin/env bash
set -e

# this script runs the test in the service provided as first argument

SERVICE=$1


# Build the image
docker build -t $SERVICE --build-arg BUILD_DIR=$SERVICE --build-arg BUILDKIT_INLINE_CACHE=1 --cache-from unlockprotocol/$SERVICE:$CIRCLE_BRANCH .

# Push images
scripts/push-images.sh $SERVICE