#!/usr/bin/env bash

# This script runs after npm install or npm ci
# it will install/ci all the subdirectories dependencies
# unless SKIP_SERVICES is set to true

if [ "$SKIP_SERVICES" != "true" ]; then

  ROOT_DIR=$(pwd)

  SERVICES=(
      docker/development
      locksmith
      newsletter
      paywall
      smart-contracts
      tests
      unlock-app
      unlock-js
      unlock-protocol.com
      wedlocks
      subgraph
  )

  for i in "${SERVICES[@]}"
  do
      cd $i
      rm -rf node_modules/
      yarn
      cd $ROOT_DIR
  done

fi
