#!/usr/bin/env bash

# This script sets the variable ENV_TARGET which is used for deployments.
# ENV_TARGET is based on the branch.
# CirclCi uses the BASH_ENV variable to set values https://circleci.com/docs/2.0/env-vars/#using-bash_env-to-set-environment-variables


if [ "$CIRCLE_BRANCH" = "production" ]; then
  echo "export ENV_TARGET='prod'"
else
  echo "export ENV_TARGET='staging'"
fi;
