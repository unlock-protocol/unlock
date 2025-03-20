import { ContractType, Env, RpcRequest } from './types'
import { getKVContractTypeKey, getCacheTTL } from './utils'

/**
 * Retrieves a contract's status from KV storage
 * Returns the contract status: UNLOCK_PROTOCOL_CONTRACT, OTHER_CONTRACT, NOT_DEPLOYED, or null if not found
 */
export const getContractStatusFromKV = async (
  env: Env,
  networkId: string,
  lockAddress: string
): Promise<ContractType | null> => {
  if (!env.ALLOWED_CONTRACTS) {
    return null
  }

  try {
    // Create a unique key combining network ID and address for multi-chain support
    const key = getKVContractTypeKey(networkId, lockAddress)
    const storedValue = await env.ALLOWED_CONTRACTS.get(key)
    if (storedValue === null) {
      return null
    }
    return storedValue as ContractType
  } catch (error) {
    console.error('Error retrieving contract status from KV:', error)
    return null
  }
}

/**
 * Stores a contract's status in KV storage
 */
export const storeContractStatusInKV = async (
  env: Env,
  networkId: string,
  lockAddress: string,
  status: ContractType
): Promise<void> => {
  if (!env.ALLOWED_CONTRACTS) {
    return
  }

  try {
    const key = getKVContractTypeKey(networkId, lockAddress)
    await env.ALLOWED_CONTRACTS.put(key, status.toString(), {
      expirationTtl: 60 * 60 * 24, // TODO extend to 1 month when we have more confidence in the contract
    })
  } catch (error) {
    console.error('Error storing contract status in KV:', error)
  }
}

/**
 * Get a cached response from KV storage
 * @param request The RPC request
 * @param chainId The chain ID
 * @param env The environment variables
 * @returns The cached response or null if not found
 *
 * First attempts to retrieve and parse as JSON directly. If that fails,
 * falls back to retrieving as text and parsing manually. If the text
 * parsing also fails, deletes the corrupted cache entry.
 */
export const getResponseFromKV = async (
  request: RpcRequest,
  chainId: string,
  env: Env
): Promise<any> => {
  if (!env.REQUEST_CACHE) {
    return null
  }

  // Generate a cache key from the request method and params
  const paramsStr = Array.isArray(request.params)
    ? request.params.join(',')
    : ''
  const cacheKey = [request.method, paramsStr].join(':')

  try {
    // Try to get and parse as JSON
    const cached = await env.REQUEST_CACHE.get(cacheKey, 'json')
    if (cached) {
      return cached
    }
  } catch (error) {
    // If JSON parsing fails, try simple text retrieval and parse it
    try {
      const rawText = await env.REQUEST_CACHE.get(cacheKey, 'text')
      if (rawText) {
        try {
          return JSON.parse(rawText)
        } catch {
          // If still can't parse, delete the corrupted entry
          await env.REQUEST_CACHE.delete(cacheKey).catch(() => {})
        }
      }
    } catch (error) {
      console.error(
        `Error reading from cache: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  return null
}

/**
 * Cache a response
 * @param request The RPC request
 * @param response The response to cache
 * @param chainId The chain ID
 * @param env The environment variables
 */
export const storeResponseInKV = async (
  request: RpcRequest,
  response: any,
  chainId: string,
  env: Env
): Promise<void> => {
  if (!env.REQUEST_CACHE || !response?.result) {
    return
  }
  const paramsStr = Array.isArray(request.params)
    ? request.params.join(',')
    : ''
  const cacheKey = [request.method, paramsStr].join(':')
  const ttl = getCacheTTL(env)

  try {
    const cacheValue = { result: response.result }
    await env.REQUEST_CACHE.put(cacheKey, JSON.stringify(cacheValue), {
      expirationTtl: ttl,
    })
  } catch (error) {
    console.error(
      `Error writing to cache: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}

/**
 * Determine if a request should be cached
 * @param request The RPC request
 * @returns True if the request should be cached, false otherwise
 */
export const shouldStore = (request: RpcRequest): boolean => {
  // Determine if the request qualifies for caching.

  if (!request.method) return false
  const lowerMethod = request.method.toLowerCase()
  return lowerMethod.includes('ens') || lowerMethod.includes('basename')
}

/**
 * Get a cached response for a request
 * @param request The RPC request
 * @param chainId The chain ID
 * @param env The environment variables
 * @returns The cached response or null if not found
 */
export const getCachedResponseForRequest = async (
  request: RpcRequest,
  chainId: string,
  env: Env
): Promise<any> => {
  if (!shouldStore(request)) {
    return null
  }
  const cached = await getResponseFromKV(request, chainId, env)
  if (cached && cached.result !== undefined) {
    return {
      id: request.id,
      jsonrpc: request.jsonrpc || '2.0',
      result: cached.result,
    }
  }
  return null
}

/**
 * Store a response in cache
 * @param request The RPC request
 * @param chainId The chain ID
 * @param response The response to cache
 * @param env The environment variables
 */
export const storeResponseInCache = async (
  request: RpcRequest,
  chainId: string,
  response: any,
  env: Env
): Promise<void> => {
  if (!shouldStore(request) || !response?.result) {
    return
  }
  await storeResponseInKV(request, response, chainId, env)
}
