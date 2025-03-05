import { Env } from './types'
import {
  RpcRequest,
  getCacheTTL,
  createCacheKey,
  isRequestCacheable,
  getKVLockKey,
} from './utils'
import { ContractType } from './types'

/**
 * RPC RESPONSE CACHING
 */

/**
 * Checks if a request is cacheable and attempts to retrieve it from cache
 * Returns the cached response if found, null otherwise
 */
export const getRPCResponseFromCache = async (
  networkId: string,
  body: RpcRequest | RpcRequest[],
  request: Request
): Promise<Response | null> => {
  try {
    // Check if this is a cacheable request
    if (!isRequestCacheable(body)) {
      return null
    }

    // Try to get the cached response
    const cacheKey = createCacheKey(networkId, body)
    const cache = caches.default
    const cachedResponse = await cache.match(new Request(cacheKey))

    if (cachedResponse) {
      // Add CORS headers to the cached response if needed
      const headers = {
        'access-control-allow-origin': '*',
      }

      // Clone the response and add CORS headers
      return new Response(cachedResponse.body, {
        status: cachedResponse.status,
        statusText: cachedResponse.statusText,
        headers: {
          ...Object.fromEntries(cachedResponse.headers.entries()),
          ...headers,
        },
      })
    }

    return null
  } catch (error) {
    console.error('Error accessing cache:', error)
    // On cache error, return null to proceed with the actual request
    return null
  }
}

/**
 * Stores a response in the cache if the request is cacheable
 * @returns true if caching was successful, false otherwise
 */
export const storeRPCResponseInCache = async (
  networkId: string,
  body: RpcRequest | RpcRequest[],
  json: any,
  env: Env
): Promise<boolean> => {
  try {
    // Check if this is a cacheable request
    if (!isRequestCacheable(body)) {
      return false
    }

    const cacheTTL = getCacheTTL(env)
    const cacheKey = createCacheKey(networkId, body)
    const cache = caches.default

    // CORS headers
    const headers = {
      'access-control-allow-origin': '*',
      'Cache-Control': `public, max-age=${cacheTTL}`,
    }

    // Create a response for caching
    const responseToCache = new Response(JSON.stringify(json), {
      headers,
    })

    // Store the response in the cache with the specified TTL
    await cache.put(new Request(cacheKey), responseToCache)
    return true
  } catch (error) {
    console.error('Error caching response:', error)
    // Continue even if caching fails
    return false
  }
}

/**
 * Contract CACHING - KV STORAGE
 */

/**
 * Retrieves a contract's status from KV storage
 * Returns the contract status: UNLOCK_PROTOCOL_CONTRACT, OTHER_CONTRACT, NOT_DEPLOYED, or null if not found
 */
export const getContractStatusFromKV = async (
  env: Env,
  networkId: string,
  lockAddress: string
): Promise<ContractType | null> => {
  if (!env.LOCK_CACHE) {
    return null
  }

  try {
    // Create a unique key combining network ID and address for multi-chain support
    const key = getKVLockKey(networkId, lockAddress)
    const value = await env.LOCK_CACHE.get(key)

    // If the key doesn't exist, return null
    if (value === null) {
      return null
    }

    // Return the stored status
    return value as ContractType
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
  if (!env.LOCK_CACHE) {
    return
  }

  try {
    const key = getKVLockKey(networkId, lockAddress)
    // Store with 30-day expiration (2592000 seconds)
    await env.LOCK_CACHE.put(key, status, { expirationTtl: 2592000 })
  } catch (error) {
    console.error('Error storing contract status in KV:', error)
  }
}
