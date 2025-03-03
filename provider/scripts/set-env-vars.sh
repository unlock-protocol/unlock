#!/bin/bash

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
  "LOCK_CACHE_KV_ID": "$LOCK_CACHE_KV_ID",
  "LOCKSMITH_SECRET_KEY": "$LOCKSMITH_SECRET_KEY"
} 
EOM

# Check if LOCK_CACHE_KV_ID is set
if [ -z "$LOCK_CACHE_KV_ID" ]; then
  echo "Warning: LOCK_CACHE_KV_ID environment variable is not set."
  echo "The KV namespace for lock caching will not be configured correctly."
  echo "Make sure to set this variable from 1Password before deploying to production."
fi

# Check if LOCKSMITH_SECRET_KEY is set
if [ -z "$LOCKSMITH_SECRET_KEY" ]; then
  echo "Warning: LOCKSMITH_SECRET_KEY environment variable is not set."
  echo "Locksmith authentication will not work correctly."
  echo "Make sure to set this variable from 1Password before deploying to production."
fi

echo $FILE | yarn wrangler secret:bulk
