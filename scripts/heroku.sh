#!/usr/bin/env bash
set -e

# two args
SERVICE=$1
HEROKU_APP_NAME=$2
HEROKU_CONTAINER_TYPE=web
COMMAND="yarn prod"
BUILD_DIRECTORY=$1

echo $1
echo $2
echo $3
echo $4

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

# install heroku client
if ! command -v heroku &>/dev/null; then
    echo "installing heroku"
    curl https://cli-assets.heroku.com/install.sh | sh
fi

# build web image
docker build --rm=false --progress=plain  -t locksmith/web --build-arg COMMAND="yarn start" .

# build worker image
docker build --rm=false --progress=plain  -t locksmith/worker --build-arg COMMAND="yarn worker:start" .

# build release image
docker build --rm=false --progress=plain  -t locksmith/release --build-arg COMMAND="yarn release" .

docker login -username=$HEROKU_EMAIL --password=$HEROKU_API_KEY registry.heroku.com

docker tag locksmith/web registry.heroku.com/$HEROKU_APP_NAME/web
docker push registry.heroku.com/$HEROKU_APP_NAME/web
docker tag locksmith/web registry.heroku.com/$HEROKU_APP_NAME/worker
docker push registry.heroku.com/$HEROKU_APP_NAME/worker
docker tag locksmith/web registry.heroku.com/$HEROKU_APP_NAME/release
docker push registry.heroku.com/$HEROKU_APP_NAME/release

# make sure we are logged in to Heroku
heroku container:login

# Release 
heroku container:release -a $HEROKU_APP_NAME web worker release

