#!/usr/bin/env bash

SERVICE=$1
BRANCH=$2

# This script is highly specific to circleci and will "succeed" early when the
# current git changes are not relevant to the folder being tested (and not on master)

SHARED_CONFIG_FILES="package.json .eslintrc.js .prettierrc"

if [ ! "$BRANCH" = "master" ]; then
  HAS_CHANGES=$(git diff `git merge-base HEAD origin/master` --name-only -- $SHARED_CONFIG_FILES $SERVICE)
  if [ ! -n "$HAS_CHANGES" ]; then
    echo "No change in $SERVICE, skipping job."
  else
    echo "changed"
  fi
fi

