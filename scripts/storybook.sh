#!/usr/bin/env bash

# this script runs the chromatic storybook visual diffs in the service provided as first argument

SERVICE=$1
BRANCH=$2
COMMIT=$3
REPO_ROOT=`dirname "$0"`/..
DOCKER_COMPOSE_FILE=$REPO_ROOT/docker/docker-compose.ci.yml
COMMAND="npm run chromatic"
OPTS=""

# on master, we will auto-accept any changes, because they have been approved in the pull request stage
if [ "$BRANCH" == "master" ]; then
  OPTS="$OPTS --auto-accept-changes"
else
  HAS_CHANGES=$(git show --name-only $COMMIT -- $SERVICE)
  if [ ! -n "$HAS_CHANGES" ]; then
    OPTS="$OPTS --skip" # If there was no change in the commit that applies to unlock-app we can skip chromatic
  fi
fi

# We pass only the relevent env vars, which are prefixed with the service name, uppercased
# UNLOCK_APP_X will be passed to the container for tests in unlock_app as X.
UPCASE_SERVICE="${SERVICE^^}"
ENV_VARS_PREFIX="${UPCASE_SERVICE//-/_}_"
ENV_VARS=`env | grep $ENV_VARS_PREFIX | awk '{print "-e ",$1}' ORS=' ' | sed -e "s/$ENV_VARS_PREFIX//g"`

docker-compose -f $DOCKER_COMPOSE_FILE run -e CI=true $ENV_VARS $SERVICE $COMMAND -- $AUTO_ACCEPT_CHANGES


