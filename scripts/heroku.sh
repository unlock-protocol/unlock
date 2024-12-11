#!/usr/bin/env bash
set -e

# two args
SERVICE=$1 # locksmith
HEROKU_APP_NAME=$2 # unlock-locksmith-staging or unlock-locksmith-production

# install heroku client
if ! command -v heroku &>/dev/null; then
  echo "installing heroku"
  curl https://cli-assets.heroku.com/install.sh | sh
fi

echo "> docker login on Heroku"

docker login -username=$HEROKU_EMAIL --password=$HEROKU_API_KEY registry.heroku.com

# build release image
echo "> docker building release image"
docker build --rm=false --progress=plain -t $SERVICE/release --build-arg COMMAND="yarn release" .
docker tag $SERVICE/release registry.heroku.com/$HEROKU_APP_NAME/release
docker push registry.heroku.com/$HEROKU_APP_NAME/release

# build web image
echo "> docker building web image"
docker build --rm=false --progress=plain -t $SERVICE/web --build-arg COMMAND="yarn start" .
docker tag $SERVICE/web registry.heroku.com/$HEROKU_APP_NAME/web
docker push registry.heroku.com/$HEROKU_APP_NAME/web

# build worker image
echo "> docker building worker image"
docker build --rm=false --progress=plain -t $SERVICE/worker --build-arg COMMAND="yarn worker:start" .
docker tag $SERVICE/worker registry.heroku.com/$HEROKU_APP_NAME/worker
docker push registry.heroku.com/$HEROKU_APP_NAME/worker


# make sure we are logged in to Heroku
heroku container:login

# Release all processes
echo "> heroku releasing web, worker, and release images"
heroku container:release -a $HEROKU_APP_NAME web worker release

