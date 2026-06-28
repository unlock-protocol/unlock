#!/bin/bash
# ABOUTME: Script to push SMTP secrets from 1Password to Cloudflare Workers via wrangler

set -euo pipefail

printf '%s' "$SMTP_HOST" | yarn exec wrangler secret put SMTP_HOST
printf '%s' "$SMTP_PORT" | yarn exec wrangler secret put SMTP_PORT
printf '%s' "$SMTP_USERNAME" | yarn exec wrangler secret put SMTP_USERNAME
printf '%s' "$SMTP_PASSWORD" | yarn exec wrangler secret put SMTP_PASSWORD
