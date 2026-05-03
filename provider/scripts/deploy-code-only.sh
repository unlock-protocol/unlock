#!/bin/bash
# ABOUTME: Guard script for deploying without syncing 1Password secrets.
# ABOUTME: Requires SKIP_SECRET_SYNC=1 to prevent accidental stale-secret deploys.
set -eu

if [ "${SKIP_SECRET_SYNC:-}" != "1" ]; then
  echo "ERROR: Set SKIP_SECRET_SYNC=1 to deploy without syncing secrets" >&2
  echo "       Run 'yarn deploy' to sync secrets and deploy together." >&2
  exit 1
fi

echo "WARNING: Deploying without syncing secrets — ensure Cloudflare secrets are current" >&2
yarn wrangler deploy
