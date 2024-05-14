#!/usr/bin/env bash

# get correct repo root
export REPO_ROOT=${PWD}
echo "root repo as: $REPO_ROOT"

# parse config path
export COMPOSE_CONFIG="-f $REPO_ROOT/docker/docker-compose.yml -f $REPO_ROOT/docker/docker-compose.integration.yml"

# Setting the right env var
export UNLOCK_ENV=test
