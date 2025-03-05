import { Env } from './types'
import {
  RpcRequest,
  getCacheTTL,
  createCacheKey,
  isRequestCacheable,
} from './utils'

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
