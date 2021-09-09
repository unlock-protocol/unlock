#!/usr/bin/env bash
set -eu

# to be added to CI env
HEROKU_API_KEY=$(heroku auth:token)
HEROKU_APP_NAME=unlock-protocol-locksmith

HEROKU_USERNAME=clement@unlock-protocol.com
DOCKER_BUILD_ARG=locksmith

# install heroku client
if ! command -v heroku &> /dev/null
then
    echo "installing heroku"
    wget -qO- https://cli-assets.heroku.com/install-ubuntu.sh 5 | sh
    exit
fi

# build image
docker info
docker build -t $DOCKER_BUILD_ARG:latest --build-arg BUILD_DIR=$DOCKER_BUILD_ARG .

# push image to Heroku registry
docker login -username=$HEROKU_USERNAME --password=$HEROKU_API_KEY registry.heroku.com
docker tag $DOCKER_BUILD_ARG:latest registry.heroku.com/$HEROKU_APP_NAME/web
docker push registry.heroku.com/$HEROKU_APP_NAME/web

# release on heroku 
heroku container:release -a $HEROKU_APP_NAME web