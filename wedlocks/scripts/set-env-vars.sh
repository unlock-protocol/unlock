#!/bin/bash
# ABOUTME: Script to push SMTP secrets from 1Password to Cloudflare Workers via wrangler

set -euo pipefail

# SMTP_HOST, SMTP_PORT, and SMTP_USERNAME are configured as Worker vars in
# wrangler.toml. Cloudflare rejects secrets that reuse those binding names.
printf '%s' "$SMTP_PASSWORD" | yarn exec wrangler secret put SMTP_PASSWORD
