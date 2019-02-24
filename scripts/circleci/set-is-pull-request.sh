#!/usr/bin/env bash

# This script sets the variable IS_PULL_REQUEST which is used for deployments.
# CirclCi uses the BASH_ENV variable to set values https://circleci.com/docs/2.0/env-vars/#using-bash_env-to-set-environment-variables


if [ -z "$CIRCLE_PULL_REQUEST" ]; then
  echo "export IS_PULL_REQUEST='false'"
else
  echo "export IS_PULL_REQUEST='true'"
fi;

