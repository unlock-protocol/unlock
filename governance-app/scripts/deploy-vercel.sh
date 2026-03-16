#!/usr/bin/env bash

set -e

APP_PATH=$1
DEPLOY_ENV=$2
COMMIT=$3
PUBLISH=$4
VERCEL_ARGS=()
SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
APP_DIR=$(cd "$SCRIPT_DIR/.." && pwd)
REPO_ROOT=$(cd "$APP_DIR/.." && pwd)

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
  cd "$REPO_ROOT"
  # The Vercel project is configured with governance-app as its root directory.
  # Running the CLI with --cwd governance-app causes the root directory to be
  # applied twice in CI, which breaks route tracing.
  npx -y vercel build -y --token "$VERCEL_TOKEN" "${VERCEL_ARGS[@]}"
  npx -y vercel deploy --prebuilt --token "$VERCEL_TOKEN" "${VERCEL_ARGS[@]}"
else
  echo "Failed to deploy to Vercel because we're missing VERCEL_TOKEN, VERCEL_PROJECT_ID and/or VERCEL_ORG_ID"
  exit 1
fi
