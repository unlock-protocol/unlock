#!/usr/bin/env bash
set -e

# this script runs the test in the service provided as first argument

SERVICE=$1
REPO_ROOT=`dirname "$0"`/..
BASE_DOCKER_COMPOSE=$REPO_ROOT/docker/docker-compose.yml
DOCKER_COMPOSE_FILE=$REPO_ROOT/docker/docker-compose.ci.yml
COMMAND="yarn run ci"


# Setting the right env var
export UNLOCK_ENV=test

# Build the core
docker build --build-arg BUILDKIT_INLINE_CACHE=1 -t unlock-core -f docker/unlock-core.dockerfile --cache-from unlockprotocol/unlock-core:$CIRCLE_BRANCH .

# Build the image
docker build --build-arg BUILDKIT_INLINE_CACHE=1 -t $SERVICE -f docker/$SERVICE.dockerfile --cache-from unlockprotocol/$SERVICE:$CIRCLE_BRANCH .

# Push images
scripts/push-images.sh $SERVICE