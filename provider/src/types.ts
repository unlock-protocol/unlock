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

  // KV namespace for caching contracts addresses
  ALLOWED_CONTRACTS?: KVNamespace
}

/**
 * Interface for RPC request format
 */
export interface RpcRequest {
  id: number | string
  jsonrpc: string
  method: string
  params: any[]
}

// Cloudflare Rate Limiting API interface
export interface RateLimiter {
  limit(options: { key: string }): Promise<{ success: boolean }>
}

/**
 * Contract type values
 */
export enum ContractType {
  UNLOCK_PROTOCOL_CONTRACT = 'UNLOCK_PROTOCOL_CONTRACT',
  OTHER_CONTRACT = 'OTHER_CONTRACT',
  NOT_DEPLOYED = 'NOT_DEPLOYED',
}

/**
 * Represents the result of processing a single RPC request
 */
export interface ProcessedRequest {
  request: RpcRequest
  response: any | null
  shouldForward: boolean
  rateLimited: boolean
}

/**
 * Represents the result of processing a batch of RPC requests
 */
export interface BatchProcessingResult {
  processedRequests: ProcessedRequest[]
  requestsToForward: RpcRequest[]
}

/**
 * Result of forwarding requests to the provider
 */
export interface ForwardingResult {
  responses?: any[]
  error?: {
    message: string
    originalError: any
  }
}

/**
 * Result of processing and forwarding requests
 */
export interface ProcessingResult {
  responses: any[]
  isBatchRequest: boolean
  error?: {
    message: string
    originalError: any
    status?: number
  }
}
