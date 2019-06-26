#!/usr/bin/env bash

SERVICE=$1
COMMIT=$2

# This script is highly specific to circleci and will "succeed" early when the
# current git changes are not relevant to the folder being tested

HAS_CHANGES=$(git show --name-only $COMMIT -- $SERVICE)
if [ ! -n "$HAS_CHANGES" ]; then
  echo "No change in $SERVICE, skipping job."
  circleci step halt
fi

