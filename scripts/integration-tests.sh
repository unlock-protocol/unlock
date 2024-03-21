#!/usr/bin/env bash
set -e

# run Unlock Protocol stack
sh -c "$REPO_ROOT/scripts/start-infra.sh"

# run the actual tests
echo "Running integration tests \n"
COMMAND="yarn workspace tests ci --network docker"
docker compose $COMPOSE_CONFIG build integration-tests
docker compose $COMPOSE_CONFIG run -e UNLOCK_ENV=test -e CI=true $EXTRA_ARGS integration-tests bash -c "$COMMAND"
