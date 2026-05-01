#!/bin/bash

set -e

REQUIRED_VARS=(
  MAINNET_PROVIDER
  OPTIMISM_PROVIDER
  BSC_PROVIDER
  GNOSIS_PROVIDER
  POLYGON_PROVIDER
  ZKSYNC_PROVIDER
  ZKEVM_PROVIDER
  ARBITRUM_PROVIDER
  CELO_PROVIDER
  AVALANCHE_PROVIDER
  BASE_SEPOLIA_PROVIDER
  BASE_PROVIDER
  SEPOLIA_PROVIDER
  LINEA_PROVIDER
  SCROLL_PROVIDER
  LOCKSMITH_SECRET_KEY
)

# Validate all required vars are set and non-empty
MISSING=()
for VAR in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!VAR}" ]; then
    MISSING+=("$VAR")
  fi
done

if [ ${#MISSING[@]} -gt 0 ]; then
  echo "ERROR: The following required environment variables are not set:"
  for VAR in "${MISSING[@]}"; do
    echo "  - $VAR"
  done
  echo "Run 'op run --env-file=.op.env -- ./scripts/set-env-vars.sh' to load from 1Password."
  exit 1
fi

read -r -d '' FILE << EOM
{
  "MAINNET_PROVIDER": "$MAINNET_PROVIDER",
  "OPTIMISM_PROVIDER": "$OPTIMISM_PROVIDER",
  "BSC_PROVIDER": "$BSC_PROVIDER",
  "GNOSIS_PROVIDER": "$GNOSIS_PROVIDER",
  "POLYGON_PROVIDER": "$POLYGON_PROVIDER",
  "ZKSYNC_PROVIDER": "$ZKSYNC_PROVIDER",
  "ZKEVM_PROVIDER": "$ZKEVM_PROVIDER",
  "ARBITRUM_PROVIDER": "$ARBITRUM_PROVIDER",
  "CELO_PROVIDER": "$CELO_PROVIDER",
  "AVALANCHE_PROVIDER": "$AVALANCHE_PROVIDER",
  "BASE_SEPOLIA_PROVIDER": "$BASE_SEPOLIA_PROVIDER",
  "BASE_PROVIDER": "$BASE_PROVIDER",
  "SEPOLIA_PROVIDER": "$SEPOLIA_PROVIDER",
  "LINEA_PROVIDER": "$LINEA_PROVIDER",
  "SCROLL_PROVIDER": "$SCROLL_PROVIDER",
  "LOCKSMITH_SECRET_KEY": "$LOCKSMITH_SECRET_KEY"
}
EOM

echo "All required environment variables are set. Pushing secrets to Cloudflare..."
echo $FILE | yarn wrangler secret bulk
