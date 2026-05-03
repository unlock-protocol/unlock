#!/bin/bash

set -e

command -v jq >/dev/null 2>&1 || { echo "ERROR: jq is required but not installed. Install it with: brew install jq (macOS) or apt install jq (Linux)"; exit 1; }

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

echo "All required environment variables are set. Pushing secrets to Cloudflare..."
jq -n \
  --arg mp  "$MAINNET_PROVIDER" \
  --arg op  "$OPTIMISM_PROVIDER" \
  --arg bsc "$BSC_PROVIDER" \
  --arg gno "$GNOSIS_PROVIDER" \
  --arg pol "$POLYGON_PROVIDER" \
  --arg zks "$ZKSYNC_PROVIDER" \
  --arg zke "$ZKEVM_PROVIDER" \
  --arg arb "$ARBITRUM_PROVIDER" \
  --arg cel "$CELO_PROVIDER" \
  --arg avx "$AVALANCHE_PROVIDER" \
  --arg bsp "$BASE_SEPOLIA_PROVIDER" \
  --arg bas "$BASE_PROVIDER" \
  --arg sep "$SEPOLIA_PROVIDER" \
  --arg lin "$LINEA_PROVIDER" \
  --arg scr "$SCROLL_PROVIDER" \
  --arg lsk "$LOCKSMITH_SECRET_KEY" \
  '{
    MAINNET_PROVIDER:       $mp,
    OPTIMISM_PROVIDER:      $op,
    BSC_PROVIDER:           $bsc,
    GNOSIS_PROVIDER:        $gno,
    POLYGON_PROVIDER:       $pol,
    ZKSYNC_PROVIDER:        $zks,
    ZKEVM_PROVIDER:         $zke,
    ARBITRUM_PROVIDER:      $arb,
    CELO_PROVIDER:          $cel,
    AVALANCHE_PROVIDER:     $avx,
    BASE_SEPOLIA_PROVIDER:  $bsp,
    BASE_PROVIDER:          $bas,
    SEPOLIA_PROVIDER:       $sep,
    LINEA_PROVIDER:         $lin,
    SCROLL_PROVIDER:        $scr,
    LOCKSMITH_SECRET_KEY:   $lsk
  }' | yarn wrangler secret bulk
