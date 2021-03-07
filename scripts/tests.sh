#!/usr/bin/env bash
set -e

# this script runs the test in the service provided as first argument

SERVICE=$1
REPO_ROOT=`dirname "$0"`/..
COMMAND="yarn run ci"

# Setting the right env var
export UNLOCK_ENV=test

# We pass only the relevent env vars, which are prefixed with the service name, uppercased
# UNLOCK_APP_X will be passed to the container for tests in unlock_app as X.
UPCASE_SERVICE="${SERVICE^^}"
ENV_VARS_PREFIX="${UPCASE_SERVICE//-/_}_"
ENV_VARS=`env | grep $ENV_VARS_PREFIX | awk '{print "-e ",$1}' ORS=' ' | sed -e "s/$ENV_VARS_PREFIX//g"`

# We cannot rely on docker compose to build the images since we have a base :(
# First we need to build the base
docker build --build-arg BUILDKIT_INLINE_CACHE=1 -t unlock-core -f docker/unlock-core.dockerfile --cache-from unlockprotocol/unlock-core:master .
docker build --build-arg BUILDKIT_INLINE_CACHE=1 -t $SERVICE -f docker/$SERVICE.dockerfile --cache-from unlockprotocol/$SERVICE:master .

docker run -t $SERVICE yarn run test