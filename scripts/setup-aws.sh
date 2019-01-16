#!/usr/bin/env bash

# This script installs aws cli in order to pull and push images from the cache
# We only do that if the required env variables are set

if [ -n "$AWS_ACCESS_KEY_ID" ] && [ -n "$AWS_SECRET_ACCESS_KEY" ]; then
  # Install aws cli w/o sudo
  pip install --user awscli;

  # Put aws in the path
  export PATH=$PATH:$HOME/.local/bin;

  # log in
  eval $(aws ecr get-login --no-include-email --region us-east-1);
fi