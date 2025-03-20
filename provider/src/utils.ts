import {
  KV_CONTRACT_TYPE_PREFIX,
  NAME_RESOLVER_METHOD_SIGNATURES,
} from './lib/constants'
import { NAME_RESOLVER_CONTRACTS } from './lib/constants'
import { DEFAULT_CACHE_TTL } from './lib/constants'
import { Env, RpcRequest } from './types'
import { ethers } from 'ethers'

/**
 * Generate a cache key from a request's method and params
 * @param request The RPC request
 * @returns The cache key
 */
export const generateRequestCacheKey = (request: RpcRequest): string => {
  let paramsStr = ''

  try {
    if (Array.isArray(request.params)) {
      // Handle each parameter individually to ensure proper serialization
      paramsStr = request.params
        .map((param) => {
          if (param === null) return 'null'
          if (typeof param === 'object') {
            // Sort keys to ensure consistent ordering regardless of original order
            return JSON.stringify(param, Object.keys(param).sort())
          }
          return String(param)
        })
        .join(',')
    }
  } catch (error) {
    console.error(
      `Error generating cache key: ${error instanceof Error ? error.message : String(error)}`
    )
    // Fallback to a simple string to avoid breaking
    paramsStr = String(request.params)
  }

  return [request.method, paramsStr].join(':')
}

// Generate the KV key for a given contract type
export const getKVContractTypeKey = (
  networkId: string,
  contractAddress: string
): string => {
  return `${KV_CONTRACT_TYPE_PREFIX}${networkId}_${contractAddress.toLowerCase()}`
}

// Methods that should be cached
export const CACHEABLE_METHODS = [
  'eth_call', // utilised by ENS resolver and other name resolution services
]

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
 * Detect if a request is an ENS/Basename lookup
 * @param request The RPC request
 * @param chainId The chain ID
 * @returns Boolean indicating if request is an ENS/Basename lookup
 */
export const isNameResolutionRequest = (
  request: RpcRequest,
  chainId: string
): boolean => {
  // Only process on networks that support ENS or Basenames
  if (!NAME_RESOLVER_CONTRACTS[chainId]) {
    return false
  }

  if (request.method !== 'eth_call') {
    return false
  }

  // Make sure params exist and have the right structure
  if (!request.params?.[0]?.to || !request.params?.[0]?.data) {
    return false
  }

  const toAddress = request.params[0].to.toLowerCase()
  const data = request.params[0].data.toLowerCase()

  // Check if the call is to a relevant contract on this network
  if (!NAME_RESOLVER_CONTRACTS[chainId].includes(toAddress)) {
    return false
  }

  // Check if the data starts with any of our method signatures
  return NAME_RESOLVER_METHOD_SIGNATURES.some((signature) =>
    data.startsWith(signature)
  )
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
