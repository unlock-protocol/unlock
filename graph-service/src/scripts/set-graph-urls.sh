#!/bin/bash

set -euo pipefail

command -v jq >/dev/null 2>&1 || { echo "ERROR: jq is required but not installed."; exit 1; }

REQUIRED_VARS=(
  MAINNET_SUBGRAPH
  OPTIMISM_SUBGRAPH
  BSC_SUBGRAPH
  GNOSIS_SUBGRAPH
  POLYGON_SUBGRAPH
  ARBITRUM_SUBGRAPH
  CELO_SUBGRAPH
  AVALANCHE_SUBGRAPH
  BASE_SUBGRAPH
  BASE_SEPOLIA_SUBGRAPH
  SEPOLIA_SUBGRAPH
  LINEA_SUBGRAPH
  SCROLL_SUBGRAPH
  ZKSYNC_SUBGRAPH
  ZKEVM_SUBGRAPH
)

MISSING=()
for VAR in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!VAR:-}" ]; then
    MISSING+=("$VAR")
  fi
done

if [ ${#MISSING[@]} -gt 0 ]; then
  echo "ERROR: The following required environment variables are not set:"
  for VAR in "${MISSING[@]}"; do
    echo "  - $VAR"
  done
  echo "Run 'op run --env-file=.op.env -- ./src/scripts/set-graph-urls.sh' to load from 1Password."
  exit 1
fi

echo "All required graph endpoint variables are set. Pushing secrets to Cloudflare..."
jq -n \
  --arg mainnet "$MAINNET_SUBGRAPH" \
  --arg optimism "$OPTIMISM_SUBGRAPH" \
  --arg bsc "$BSC_SUBGRAPH" \
  --arg gnosis "$GNOSIS_SUBGRAPH" \
  --arg polygon "$POLYGON_SUBGRAPH" \
  --arg arbitrum "$ARBITRUM_SUBGRAPH" \
  --arg celo "$CELO_SUBGRAPH" \
  --arg avalanche "$AVALANCHE_SUBGRAPH" \
  --arg base "$BASE_SUBGRAPH" \
  --arg baseSepolia "$BASE_SEPOLIA_SUBGRAPH" \
  --arg sepolia "$SEPOLIA_SUBGRAPH" \
  --arg linea "$LINEA_SUBGRAPH" \
  --arg scroll "$SCROLL_SUBGRAPH" \
  --arg zksync "$ZKSYNC_SUBGRAPH" \
  --arg zkevm "$ZKEVM_SUBGRAPH" \
  '{
    MAINNET_SUBGRAPH: $mainnet,
    OPTIMISM_SUBGRAPH: $optimism,
    BSC_SUBGRAPH: $bsc,
    GNOSIS_SUBGRAPH: $gnosis,
    POLYGON_SUBGRAPH: $polygon,
    ARBITRUM_SUBGRAPH: $arbitrum,
    CELO_SUBGRAPH: $celo,
    AVALANCHE_SUBGRAPH: $avalanche,
    BASE_SUBGRAPH: $base,
    BASE_SEPOLIA_SUBGRAPH: $baseSepolia,
    SEPOLIA_SUBGRAPH: $sepolia,
    LINEA_SUBGRAPH: $linea,
    SCROLL_SUBGRAPH: $scroll,
    ZKSYNC_SUBGRAPH: $zksync,
    ZKEVM_SUBGRAPH: $zkevm
  }' | yarn wrangler secret bulk
