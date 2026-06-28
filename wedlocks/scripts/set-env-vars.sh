#!/bin/bash
# ABOUTME: Script to push SMTP secrets from 1Password to Cloudflare Workers via wrangler

set -euo pipefail

printf '%s' "$SMTP_HOST" | yarn wrangler secret put SMTP_HOST
printf '%s' "$SMTP_PORT" | yarn wrangler secret put SMTP_PORT
printf '%s' "$SMTP_USERNAME" | yarn wrangler secret put SMTP_USERNAME
printf '%s' "$SMTP_PASSWORD" | yarn wrangler secret put SMTP_PASSWORD
