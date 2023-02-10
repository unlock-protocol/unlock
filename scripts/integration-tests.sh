#!/usr/bin/env bash
set -e

# First this script will deploy 
REPO_ROOT=`dirname "$0"`/..
INTEGRATION_TESTS_FOLDER=$REPO_ROOT/tests
EXTRA_ARGS=$*

# run Unlock Protocol stack
sh -c "./run-stack-dockerized.sh"

# run the actual tests
sh $INTEGRATION_TESTS_FOLDER/bin/tests.sh