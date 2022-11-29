#!/usr/bin/env bash
set -e

# two args
SERVICE=$1
HEROKU_APP_NAME=$2
HEROKU_CONTAINER_TYPE=web
COMMAND="yarn prod"
BUILD_DIRECTORY=$1

# if container type is provided, use it instead of default
if [ -n "${3}" ]; then
    HEROKU_CONTAINER_TYPE=$3
fi

# if command to run is provided, use it instead.
if [ -n "${4}" ]; then 
    COMMAND=$4
fi

# if build directory argument provided, use it instead
if [ -n "${5}" ]; then
    BUILD_DIRECTORY=$5
fi

echo "Using $BUILD_DIRECTORY as build directory"

echo "Using $COMMAND as the start command for container"

echo "Deploying $SERVICE to Heroku $HEROKU_APP_NAME ..."

# install heroku client
if ! command -v heroku &> /dev/null
then
    echo "installing heroku"
    curl https://cli-assets.heroku.com/install.sh | sh
fi

# build image
docker build --rm=false --progress=plain -t registry.heroku.com/$HEROKU_APP_NAME/$HEROKU_CONTAINER_TYPE --build-arg COMMAND="$COMMAND" --build-arg BUILD_DIR="$BUILD_DIRECTORY" .

# push image to Heroku registry
docker login -username=$HEROKU_EMAIL --password=$HEROKU_API_KEY registry.heroku.com
docker push registry.heroku.com/$HEROKU_APP_NAME/$HEROKU_CONTAINER_TYPE

#make sure we are logged in
heroku container:login

# release on heroku 
heroku container:release -a $HEROKU_APP_NAME $HEROKU_CONTAINER_TYPE

# migrate the database
heroku run --app $HEROKU_APP_NAME --type $HEROKU_CONTAINER_TYPE yarn db:migrate