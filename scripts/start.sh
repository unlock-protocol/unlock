#!/usr/bin/env bash

# This script starts the application.
# Based on the environment it may also deploy the smart contracts.

if [ -n "$CI" ]; then
  # We need to deploy the locks
  cd unlock-app
  npm run deploy-unlock-contract
  cd ".."
fi

# Start the application
cd unlock-app
npm run start