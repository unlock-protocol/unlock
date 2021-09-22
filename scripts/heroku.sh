#!/usr/bin/env bash
set -eu

# two args
SERVICE=$1
HEROKU_APP_NAME=$2

echo "Deploying $SERVICE to Heroku $HEROKU_APP_NAME ..."

# install heroku client
if ! command -v heroku &> /dev/null
then
    echo "installing heroku"
    curl https://cli-assets.heroku.com/install.sh | sh
fi

# build image
docker build --rm=false --progress=plain -t registry.heroku.com/$HEROKU_APP_NAME/web --build-arg BUILD_DIR=$SERVICE .

# push image to Heroku registry
docker login -username=$HEROKU_EMAIL --password=$HEROKU_API_KEY registry.heroku.com
docker push registry.heroku.com/$HEROKU_APP_NAME/web

#make sure we are logged in
heroku container:login

# release on heroku 
heroku container:release -a $HEROKU_APP_NAME web

# migrate the database
heroku run --app $HEROKU_APP_NAME yarn db:migrate