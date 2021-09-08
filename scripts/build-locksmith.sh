#!/usr/bin/env bash

set -ex

USERNAME=unlockprotocol
IMAGE=locksmith

docker build -t $USERNAME/$IMAGE:latest --build-arg BUILD_DIR=locksmith .