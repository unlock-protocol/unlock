#!/usr/bin/env bash

# This script loads a previously built images from our docker hub on AWS.
# This should only run on any travis build

# install aws cli w/o sudo
pip install --user awscli;

# put aws in the path
export PATH=$PATH:$HOME/.local/bin;

if [ -n "$AWS_ACCESS_KEY_ID" ] && [ -n "$AWS_SECRET_ACCESS_KEY" ]; then
  #needs AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY envvars
  eval $(aws ecr get-login --no-include-email --region us-east-1);
  docker pull 461040265176.dkr.ecr.us-east-1.amazonaws.com/unlock:latest;
else
  echo "Skipping cache pulling"
fi