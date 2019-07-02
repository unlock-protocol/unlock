#!/usr/bin/env bash

set -ex
# SET THE FOLLOWING VARIABLES
# docker hub username
USERNAME=unlockprotocol
IMAGE=locksmith
REPO_ROOT=`dirname "$0"`/..

version=`cat ${REPO_ROOT}/locksmith/VERSION`
echo "version: $version"

./build-locksmith.sh
docker tag $USERNAME/$IMAGE:latest $USERNAME/$IMAGE:$version
# push it
docker push $USERNAME/$IMAGE:latest
docker push $USERNAME/$IMAGE:$version