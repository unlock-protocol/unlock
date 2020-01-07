#!/usr/bin/env bash

# This script runs after npm install or npm ci
# it will install/ci all the subdirectories dependencies
# unless SKIP_SERVICES is set to true

if [ "$SKIP_SERVICES" != "true" ]; then

  SERVICES=( smart-contracts tickets wedlocks unlock-js unlock-protocol.com docker/development )
  ROOT_DIR=$(pwd)
  for i in "${SERVICES[@]}"
  do
      cd $i
      npm ci # We run npm ci by default. &
      cd $ROOT_DIR
  done

  wait

  # Copy the parent binaries into the sub projects
  npm run link-parent-bin
  # remove node_modules from subfolders who do not need it
  # TODO: fix link-parent-bin to only run in the folders where we need it!
  rm -rf .circleci/node_modules
  rm -rf .git/node_modules
  rm -rf .github/node_modules
  rm -rf docker/node_modules
  rm -rf scripts/node_modules
  rm -rf versions/node_modules
  rm -rf wiki/node_modules

  NEW_SERVICES=( newsletter locksmith paywall unlock-app tests )
  for i in "${NEW_SERVICES[@]}"
  do
      cd $i
      rm -rf node_modules/
      yarn
      cd $ROOT_DIR
  done
fi
