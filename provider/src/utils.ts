import { Env } from './types'
import { ethers } from 'ethers'

// Default cache TTL in seconds (1 hour)
export const DEFAULT_CACHE_TTL = 60 * 60

// Cache API TTL in seconds (1 day)
export const CACHE_API_TTL = 86400

// Key prefix for KV storage to avoid collisions
export const KV_LOCK_PREFIX = 'lock_'

// Generate the KV key for a given lock
export const getKVLockKey = (
  networkId: string,
  lockAddress: string
): string => {
  return `${KV_LOCK_PREFIX}${networkId}_${lockAddress.toLowerCase()}`
}

// Methods that should be cached
export const CACHEABLE_METHODS = [
  'eth_call', // utilised by ENS resolver and other name resolution services
]

/**
 * Interface for RPC request format
 */
export interface RpcRequest {
  id: number
  jsonrpc: string
  method: string
  params: any[]
}

/**
 * Get the cache TTL from environment or use default
 */
export const getCacheTTL = (env: Env): number => {
  if (env.CACHE_DURATION_SECONDS) {
    const duration = parseInt(env.CACHE_DURATION_SECONDS, 10)
    // Validate the parsed value is a positive number
    if (!isNaN(duration) && duration > 0) {
      return duration
    }
    console.warn(
      `Invalid CACHE_DURATION_SECONDS value: ${env.CACHE_DURATION_SECONDS}, using default: ${DEFAULT_CACHE_TTL}`
    )
  }
  return DEFAULT_CACHE_TTL
}

/**
 * Check if the request is for name resolution (ENS or Base name)
 */
export const isNameResolutionRequest = (body: RpcRequest): boolean => {
  if (!body || !body.method || body.method !== 'eth_call') return false

  // ENS and BaseName resolution typically use eth_call with specific contract data
  // This checks for common ENS and BaseName resolution patterns in the call data
  const callParams = body.params[0] as { data?: string } | undefined
  if (!callParams || !callParams.data) return false

  const callData = callParams.data.toLowerCase()

  // ENS resolver methods
  const ensPatterns = [
    '0x3b3b57de', // addr(bytes32)
    '0xf1cb7e06', // addr(bytes32,uint256)
    '0x691f3431', // name(bytes32)
    '0x2203ab56', // text(bytes32,string)
  ]

  // Base Name resolver patterns (L2 resolver methods)
  const baseNamePatterns = [
    '0x691f3431', // name(bytes32)
  ]

  const isNameResolution =
    ensPatterns.some((pattern) => callData.startsWith(pattern)) ||
    baseNamePatterns.some((pattern) => callData.startsWith(pattern))

  return isNameResolution
}

/**
 * Create a cache key from a request
 */
export const createCacheKey = (
  networkId: string,
  body: RpcRequest | RpcRequest[]
): string => {
  /*
   * For name resolution, we want to cache based on the method and params
   * Using a standardized fake domain for all cache operations
   * This is just a convention - not an actual domain - to create a properly formatted
   * cache key that satisfies the Request object format requirements
   */
  if (Array.isArray(body)) {
    // For batch requests, use the first request's method and params
    if (body.length === 0) {
      return `https://cache.unlock-protocol.com/rpc-cache/${networkId}/batch/empty`
    }
    const firstRequest = body[0]
    return `https://cache.unlock-protocol.com/rpc-cache/${networkId}/batch/${firstRequest.method}/${encodeURIComponent(JSON.stringify(firstRequest.params))}`
  }

  return `https://cache.unlock-protocol.com/rpc-cache/${networkId}/${body.method}/${encodeURIComponent(JSON.stringify(body.params))}`
}

/**
 * Check if a request is cacheable (can handle both single and batch requests)
 */
export const isRequestCacheable = (
  body: RpcRequest | RpcRequest[]
): boolean => {
  if (Array.isArray(body)) {
    // For batch requests, check if any request is cacheable
    return body.some((req) => isSingleRequestCacheable(req))
  }
  return isSingleRequestCacheable(body)
}

/**
 * Helper to check if a single request is cacheable
 */
export const isSingleRequestCacheable = (req: RpcRequest): boolean => {
  if (!req || !req.method || !req.params) return false

  return CACHEABLE_METHODS.includes(req.method) && isNameResolutionRequest(req)
}

/**
 * Extract the client IP address from the request
 * This function supports Cloudflare-specific headers to get the real client IP
 */
export const getClientIP = (request: Request): string => {
  try {
    // Try to get the IP from CF-Connecting-IP header (set by Cloudflare)
    const cfConnectingIP = request.headers.get('CF-Connecting-IP')
    if (cfConnectingIP) {
      return cfConnectingIP
    }

    // Fallback to X-Forwarded-For header
    const forwardedFor = request.headers.get('X-Forwarded-For')
    if (forwardedFor) {
      // X-Forwarded-For can contain multiple IPs, use the first one which is the client
      return forwardedFor.split(',')[0].trim()
    }

    // Generate a unique identifier based on CF-Ray ID or request properties
    const cfRayId = request.headers.get('CF-Ray')
    if (cfRayId) {
      return `unknown-ip-${cfRayId}`
    }

    // Final fallback - generate a fingerprint from request details
    // Use the URL, method, and a timestamp to create a somewhat unique identifier
    const requestFingerprint = `${request.url}-${request.method}-${Date.now()}`
    return `unknown-ip-${requestFingerprint.slice(0, 32)}`
  } catch (error) {
    console.error('Error extracting client IP:', error)
    return `error-ip-${Date.now()}`
  }
}

/**
 * Group similar methods for rate limiting purposes
 */
export const getMethodGroup = (method: string): string | null => {
  // Grouped by similar function and expected volume
  const readMethods = [
    'eth_call',
    'eth_getBalance',
    'eth_getCode',
    'eth_getTransactionCount',
    'eth_getStorageAt',
    'eth_getBlockByNumber',
    'eth_getBlockByHash',
  ]

  const writeMethods = [
    'eth_sendRawTransaction',
    'eth_sendTransaction',
    'eth_estimateGas',
  ]

  const eventMethods = ['eth_getLogs', 'eth_getFilterLogs', 'eth_newFilter']

  if (readMethods.includes(method)) return 'read'
  if (writeMethods.includes(method)) return 'write'
  if (eventMethods.includes(method)) return 'event'

  return null
}

/**
 * Extract contract address from RPC method params
 * This function supports common RPC methods that interact with contracts
 */
export const getContractAddress = (
  method: string | undefined,
  params: any[]
): string | null => {
  if (!method || !params || params.length === 0) return null

  try {
    // Common RPC methods that interact with contracts directly with 'to' field
    if (
      ['eth_call', 'eth_estimateGas', 'eth_sendTransaction'].includes(method)
    ) {
      const txParams = params[0]
      if (txParams && typeof txParams === 'object' && 'to' in txParams) {
        const address = txParams.to
        return typeof address === 'string' ? address : null
      }
    }

    // eth_getLogs and eth_getFilterLogs may contain contract address in 'address' field
    if (['eth_getLogs', 'eth_getFilterLogs'].includes(method)) {
      const filterParams = params[0]
      if (
        filterParams &&
        typeof filterParams === 'object' &&
        'address' in filterParams
      ) {
        const address = filterParams.address
        return typeof address === 'string' ? address : null
      }
    }

    // eth_getCode, eth_getBalance, eth_getTransactionCount, eth_getStorageAt
    // These methods have the address as the first parameter
    if (
      [
        'eth_getCode',
        'eth_getBalance',
        'eth_getTransactionCount',
        'eth_getStorageAt',
      ].includes(method)
    ) {
      if (typeof params[0] === 'string') {
        return params[0]
      }
    }

    return null
  } catch (error) {
    console.error(
      `Error extracting contract address from method ${method}:`,
      error
    )
    return null
  }
}

/**
 * Generate Cache API key for a lock
 */
export const getCacheApiKey = (networkId: string, address: string): string => {
  // Use a valid URL format as required by Cloudflare's Cache API
  // Using a standardized fake domain for all cache operations
  return `https://cache.unlock-protocol.com/lock-check/${networkId}/${address.toLowerCase()}`
}

/**
 * Create an ethers provider from the RPC URL
 */
export const createEthersProvider = (
  rpcUrl: string
): ethers.JsonRpcProvider => {
  return new ethers.JsonRpcProvider(rpcUrl)
}

/**
 * Checks if the request has the correct Locksmith secret key
 */
export const hasValidLocksmithSecret = (
  request: Request,
  env: Env
): boolean => {
  try {
    if (!env.LOCKSMITH_SECRET_KEY) return false

    // Get the secret from the query parameter
    const url = new URL(request.url)
    const secret = url.searchParams.get('secret')

    // Check if the secret matches
    return secret === env.LOCKSMITH_SECRET_KEY
  } catch (error) {
    console.error('Error checking Locksmith secret:', error)
    return false
  }
}
