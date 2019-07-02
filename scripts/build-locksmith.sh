#!/usr/bin/env bash

set -ex

USERNAME=unlockprotocol
IMAGE=locksmith

docker build -t $USERNAME/$IMAGE:latest ../locksmith