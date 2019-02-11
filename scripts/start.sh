#!/usr/bin/env bash

# This script starts the application.
# Based on the environment it may also deploy the smart contracts.

if [ -n "$CI" ]; then
  # Before running the application, when in CI, we first need to deploy the smart contracts
  # The artifact needs to be re-written before the application starts
  cd smart-contracts
  npm run deploy -- --network development
  cd ".."

  # We need to rebuild the application to take the changes to artifacts files into account
  cd unlock-app
  npm run build
  cd ".."
fi

# Start the application
cd unlock-app
npm run start