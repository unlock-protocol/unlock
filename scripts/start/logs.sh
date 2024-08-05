#!/usr/bin/env bash

# Just a helper to log things from the running infra
# All cli args will be passed to the docker compose command

set -e

# export required envs
source ./scripts/start/envs.sh

docker compose $COMPOSE_CONFIG logs "$@"