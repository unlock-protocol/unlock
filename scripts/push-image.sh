#!/usr/bin/env bash

# This script saves previously built images to docker hub on AWS.
# This should only run on master merges

if [ "$TRAVIS_BRANCH" = "master" ] && [ "$TRAVIS_PULL_REQUEST" = "false" ]; then

  # install aws cli w/o sudo
  pip install --user awscli;

  # put aws in the path
  export PATH=$PATH:$HOME/.local/bin;

  #needs AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY envvars
  eval $(aws ecr get-login --no-include-email --region us-east-1);

  docker tag unlock:latest 461040265176.dkr.ecr.us-east-1.amazonaws.com/unlock:latest;

  docker push 461040265176.dkr.ecr.us-east-1.amazonaws.com/unlock:latest;
else
  echo "Skipping docker image push as this is not a master push."
fi
