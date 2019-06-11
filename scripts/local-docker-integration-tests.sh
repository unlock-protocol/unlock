#!/usr/bin/env bash
# This script is only used locally. It runs the integration tests in the same environment
# that they are run in when running on the CI server.
# The only dependency is on docker, everything else happens inside the containers
# usage:
#
# scripts/local-docker-integration-tests.sh

# First this script will deploy from an instance of unlock:latest
REPO_ROOT=`dirname "$0"`/..
DOCKER_COMPOSE_FILE=$REPO_ROOT/docker/docker-compose.ci.yml
EXTRA_ARGS=$*

# set the environment variables needed for integration testing
eval "$($REPO_ROOT/scripts/set-integration-tests-env-variables.sh)"

# if the integration test images are running, this ensures we remove any state
# prior to attempting to run the tests. This line is critical!
docker-compose -f $DOCKER_COMPOSE_FILE down

# re-build the images. This will use local docker cache
# and because we source the script, it will inherit our environment variables
# NOTE: we cannot using the build-image.sh script or docker-compose-build.sh scripts
# they are designed for CI and never hit cache locally.

docker build -t unlock-core -f $REPO_ROOT/docker/unlock-core.dockerfile $REPO_ROOT

docker build -t unlock-app -f $REPO_ROOT/docker/unlock-app.dockerfile $REPO_ROOT &
docker build -t wedlocks -f $REPO_ROOT/docker/wedlocks.dockerfile $REPO_ROOT &
docker build -t smart-contracts -f $REPO_ROOT/docker/smart-contracts.dockerfile $REPO_ROOT &
docker build -t paywall -f $REPO_ROOT/docker/paywall.dockerfile $REPO_ROOT &
docker build -t locksmith -f $REPO_ROOT/docker/locksmith.dockerfile $REPO_ROOT &
docker build -t unlock-protocol-com -f $REPO_ROOT/docker/unlock-protocol-com.dockerfile $REPO_ROOT &
docker build -t integration-tests -f $REPO_ROOT/docker/integration-tests.dockerfile $REPO_ROOT &
wait

# Run the tests
$REPO_ROOT/scripts/integration-tests.sh $EXTRA_ARGS

# shut down the docker file in case we want to do any local dev
docker-compose -f $DOCKER_COMPOSE_FILE down
