#!/usr/bin/env bash

# The script exposes the logs of all docker running instances when using compose
# This should be invoked upon failure to provide details about the failure

docker compose -f docker/docker-compose.yml -f docker/docker-compose.ci.yml logs --timestamps --tail="all"