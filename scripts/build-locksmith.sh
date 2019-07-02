#!/usr/bin/env bash

set -ex

USERNAME=unlockprotocol
IMAGE=locksmith
REPO_ROOT=`dirname "$0"`/..

docker build -t $USERNAME/$IMAGE:latest $REPO_ROOT/locksmith