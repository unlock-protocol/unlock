import { Env } from './types'
import {
  RpcRequest,
  getCacheTTL,
  createCacheKey,
  isRequestCacheable,
  getKVContractTypeKey,
  isSingleRequestCacheable,
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
    // Handle batch requests by storing each response individually
    if (Array.isArray(body) && Array.isArray(json)) {
      const results = await Promise.all(
        body.map(async (request, index) => {
          // Only cache if the individual request is cacheable
          if (!isSingleRequestCacheable(request)) {
            return false
          }

          // Get the corresponding response
          const response = json[index]
          if (!response) {
            return false
          }

          // Store the individual response
          return storeIndividualResponseInCache(
            networkId,
            request,
            response,
            env
          )
        })
      )

      // Return true if any request was cached
      return results.some((result) => result)
    }

    // Handle single request
    if (!isRequestCacheable(body)) {
      return false
    }

    return storeIndividualResponseInCache(
      networkId,
      body as RpcRequest,
      json,
      env
    )
  } catch (error) {
    console.error('Error caching response:', error)
    // Continue even if caching fails
    return false
  }
}

/**
 * Helper function to store a single response in the cache
 */
const storeIndividualResponseInCache = async (
  networkId: string,
  request: RpcRequest,
  response: any,
  env: Env
): Promise<boolean> => {
  try {
    const cacheTTL = getCacheTTL(env)
    const cacheKey = createCacheKey(networkId, request)
    const cache = caches.default

    // CORS headers
    const headers = {
      'access-control-allow-origin': '*',
      'Cache-Control': `public, max-age=${cacheTTL}`,
    }

    // Create a response for caching
    const responseToCache = new Response(JSON.stringify(response), {
      headers,
    })

    // Store the response in the cache with the specified TTL
    await cache.put(new Request(cacheKey), responseToCache)
    return true
  } catch (error) {
    console.error('Error caching individual response:', error)
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
