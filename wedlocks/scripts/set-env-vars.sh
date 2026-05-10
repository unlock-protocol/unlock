#!/bin/bash
# ABOUTME: Script to push SMTP secrets from 1Password to Cloudflare Workers via wrangler

set -euo pipefail

echo "$SMTP_HOST" | yarn wrangler secret put SMTP_HOST
echo "$SMTP_PORT" | yarn wrangler secret put SMTP_PORT
echo "$SMTP_USERNAME" | yarn wrangler secret put SMTP_USERNAME
echo "$SMTP_PASSWORD" | yarn wrangler secret put SMTP_PASSWORD
