#!/usr/bin/env bash

# The script builds the cluster
REPO_ROOT=`dirname "$0"`/..
DOCKER_REPOSITORY="unlockprotocol"
BRANCH="master"

# We first need to build unlock-core because it is used by all other docker images
docker pull "$DOCKER_REPOSITORY/unlock-core:$BRANCH"
ARGS="--cache-from $DOCKER_REPOSITORY/unlock-core:master"
docker build -t unlock-core -f $REPO_ROOT/docker/unlock-core.dockerfile $ARGS $REPO_ROOT

# # First build all of the images
# . $REPO_ROOT/scripts/build-image.sh unlock-app true &
# . $REPO_ROOT/scripts/build-image.sh wedlocks true &
# . $REPO_ROOT/scripts/build-image.sh smart-contracts true &
# . $REPO_ROOT/scripts/build-image.sh paywall true &
# . $REPO_ROOT/scripts/build-image.sh locksmith true &
# . $REPO_ROOT/scripts/build-image.sh nudge true &
# . $REPO_ROOT/scripts/build-image.sh unlock-protocol-com true &
# . $REPO_ROOT/scripts/build-image.sh integration-tests true &
# wait

# And then finish if anything else is needed
docker-compose -f $REPO_ROOT/docker/docker-compose.yml -f $REPO_ROOT/docker/docker-compose.ci.yml build
