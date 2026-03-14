#!/usr/bin/env bash

set -e

APP_PATH=$1
DEPLOY_ENV=$2
COMMIT=$3
PUBLISH=$4
VERCEL_ARGS=()

if [ "$DEPLOY_ENV" = "staging" ]; then
  if [ "$PUBLISH" = "true" ]; then
    VERCEL_ARGS+=("--prod")
  fi
fi

if [ "$DEPLOY_ENV" = "prod" ]; then
  VERCEL_ARGS+=("--prod")
fi

echo "READY TO DEPLOY $APP_PATH $DEPLOY_ENV ${VERCEL_ARGS[*]} (commit $COMMIT) TO VERCEL $VERCEL_PROJECT_ID $VERCEL_ORG_ID"

if [ -n "$VERCEL_PROJECT_ID" ] && [ -n "$VERCEL_TOKEN" ] && [ -n "$VERCEL_ORG_ID" ]; then
  export UNLOCK_ENV="$DEPLOY_ENV"
  export NEXT_PUBLIC_UNLOCK_ENV="$DEPLOY_ENV"
  cd ..
  npx -y vercel build -y --cwd "$APP_PATH" --token "$VERCEL_TOKEN" "${VERCEL_ARGS[@]}"
  npx -y vercel deploy --cwd "$APP_PATH" --prebuilt --token "$VERCEL_TOKEN" "${VERCEL_ARGS[@]}"
else
  echo "Failed to deploy to Vercel because we're missing VERCEL_TOKEN, VERCEL_PROJECT_ID and/or VERCEL_ORG_ID"
  exit 1
fi
