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

docker login -username=$HEROKU_EMAIL --password=$HEROKU_API_KEY registry.heroku.com

# build release image
docker build --rm=false --progress=plain -t $SERVICE/release --build-arg COMMAND="yarn release" .
docker tag $SERVICE/release registry.heroku.com/$HEROKU_APP_NAME/release
docker push registry.heroku.com/$HEROKU_APP_NAME/release

# build web image
docker build --rm=false --progress=plain -t $SERVICE/web --build-arg COMMAND="yarn start" .
docker tag $SERVICE/web registry.heroku.com/$HEROKU_APP_NAME/web
docker push registry.heroku.com/$HEROKU_APP_NAME/web

# build worker image
docker build --rm=false --progress=plain -t $SERVICE/worker --build-arg COMMAND="yarn worker:start" .
docker tag $SERVICE/worker registry.heroku.com/$HEROKU_APP_NAME/worker
docker push registry.heroku.com/$HEROKU_APP_NAME/worker


# make sure we are logged in to Heroku
heroku container:login

# Release all processes
heroku container:release -a $HEROKU_APP_NAME web worker release

