#!/usr/bin/env bash

# This script sets the variable IS_FORKED_PR which is used for deployments.
# CIRCLE_PR_USERNAME is ony set for forked PRs.
# CirclCi uses the BASH_ENV variable to set values https://circleci.com/docs/2.0/env-vars/#using-bash_env-to-set-environment-variables


if [ -n "$CIRCLE_PR_USERNAME" ]; then
  echo "export IS_FORKED_PR='true'"
else
  echo "export IS_FORKED_PR='false'"
fi;

