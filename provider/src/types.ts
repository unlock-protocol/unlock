export interface Env {
  ARBITRUM_PROVIDER: string
  AVALANCHE_PROVIDER: string
  BSC_PROVIDER: string
  CELO_PROVIDER: string
  GNOSIS_PROVIDER: string
  MAINNET_PROVIDER: string
  OPTIMISM_PROVIDER: string
  POLYGON_PROVIDER: string
  ZKSYNC_PROVIDER: string
  BASE_SEPOLIA_PROVIDER: string
  BASE_PROVIDER: string
  SEPOLIA_PROVIDER: string
  LINEA_PROVIDER: string
  ZKEVM_PROVIDER: string
  SCROLL_PROVIDER: string

  // Optional environment variable for configuring cache duration in seconds
  CACHE_DURATION_SECONDS?: string

  // Secret key for authenticating requests from Locksmith
  LOCKSMITH_SECRET_KEY?: string

  // Cloudflare Rate Limiting API bindings
  STANDARD_RATE_LIMITER: RateLimiter
  HOURLY_RATE_LIMITER: RateLimiter

  // KV namespace for caching lock addresses
  LOCK_CACHE?: KVNamespace
}

// Cloudflare Rate Limiting API interface
export interface RateLimiter {
  limit(options: { key: string }): Promise<{ success: boolean }>
}

/**
 * Contract type values
 */
export enum ContractType {
  UNLOCK_PROTOCOL_CONTRACT = 1,
  OTHER_CONTRACT = 2,
  NOT_DEPLOYED = 3,
}
