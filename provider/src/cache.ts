import { Env } from './types'
import {
  RpcRequest,
  getCacheTTL,
  createCacheKey,
  isRequestCacheable,
  KV_LOCK_PREFIX,
  CACHE_API_TTL,
  getCacheApiKey,
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

/**
 * Retrieves a lock's status from KV storage
 * Returns true if it's a lock, false if it's explicitly not a lock, null if not found
 */
export const getLockFromKV = async (
  env: Env,
  networkId: string,
  lockAddress: string
): Promise<boolean | null> => {
  if (!env.LOCK_CACHE) {
    return null
  }

  try {
    // Create a unique key combining network ID and address for multi-chain support
    const key = `${KV_LOCK_PREFIX}${networkId}_${lockAddress.toLowerCase()}`
    const value = await env.LOCK_CACHE.get(key)

    // If the key doesn't exist, return null
    if (value === null) {
      return null
    }

    // Return true if value is "true", false if value is "false"
    return value === 'true'
  } catch (error) {
    console.error('Error retrieving contract status from KV:', error)
    return null
  }
}

/**
 * Stores a lock in KV storage
 */
export const storeLockInKV = async (
  env: Env,
  networkId: string,
  lockAddress: string
): Promise<void> => {
  if (!env.LOCK_CACHE) {
    return
  }

  try {
    const key = `${KV_LOCK_PREFIX}${networkId}_${lockAddress.toLowerCase()}`
    // Store with 30-day expiration
    await env.LOCK_CACHE.put(key, 'true', { expirationTtl: 2592000 })
  } catch (error) {
    console.error('Error storing lock in KV:', error)
  }
}

/**
 * Stores a non-lock in KV storage
 */
export const storeNonLockInKV = async (
  env: Env,
  networkId: string,
  lockAddress: string
): Promise<void> => {
  if (!env.LOCK_CACHE) {
    return
  }

  try {
    const key = `${KV_LOCK_PREFIX}${networkId}_${lockAddress.toLowerCase()}`
    // Store with 30-day expiration
    await env.LOCK_CACHE.put(key, 'false', { expirationTtl: 2592000 })
  } catch (error) {
    console.error('Error storing non-lock in KV:', error)
  }
}

/**
 * Gets a lock from Cache API
 */
export const getLockFromCacheAPI = async (
  networkId: string,
  address: string
): Promise<boolean | null> => {
  try {
    const cacheKey = getCacheApiKey(networkId, address)
    const cache = caches.default
    const cachedResponse = await cache.match(new Request(cacheKey))

    if (cachedResponse) {
      const result = (await cachedResponse.json()) as { isLock: boolean }
      return result.isLock === true
    }

    return null
  } catch (error) {
    console.error('Error retrieving lock from Cache API:', error)
    return null
  }
}

/**
 * Stores a lock status in Cache API
 */
export const storeLockInCacheAPI = async (
  networkId: string,
  address: string,
  isLock: boolean
): Promise<void> => {
  try {
    const cacheKey = getCacheApiKey(networkId, address)
    const cache = caches.default

    await cache.put(
      new Request(cacheKey),
      new Response(JSON.stringify({ isLock }), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': `max-age=${CACHE_API_TTL}`,
        },
      })
    )
  } catch (error) {
    console.error('Error storing lock in Cache API:', error)
  }
}

// =============================================================================
// LOCK CONTRACT CACHING AND VERIFICATION - UNIFIED INTERFACE
// =============================================================================

/**
 * In-memory caches for lock verification status
 */
// Local in-memory cache of verified locks
let MEMORY_VERIFIED_LOCKS: { [address: string]: boolean } = {}

// Non-lock addresses
let MEMORY_VERIFIED_NON_LOCKS: { [address: string]: boolean } = {}

// Access count tracking for high-frequency locks
let LOCK_ACCESS_COUNT: { [key: string]: number } = {}

// Export for testing purposes
export const resetMemoryCaches = () => {
  MEMORY_VERIFIED_LOCKS = {}
  MEMORY_VERIFIED_NON_LOCKS = {}
  LOCK_ACCESS_COUNT = {}
}

/**
 * Check if a contract address is cached in memory
 * @returns true if verified lock, false if verified non-lock, null if unknown
 */
export const getLockStatusFromMemory = (address: string): boolean | null => {
  const normalizedAddress = address.toLowerCase()

  // Check if this is a known lock
  if (MEMORY_VERIFIED_LOCKS[normalizedAddress] === true) {
    return true
  }

  // Check if this is a known non-lock
  if (MEMORY_VERIFIED_NON_LOCKS[normalizedAddress] === true) {
    return false
  }

  // Not in memory cache
  return null
}

/**
 * Add a verified lock to the memory cache
 */
export const addVerifiedLockToMemory = (address: string): void => {
  const normalizedAddress = address.toLowerCase()
  MEMORY_VERIFIED_LOCKS[normalizedAddress] = true
}

/**
 * Add a verified non-lock to the memory cache
 */
export const addVerifiedNonLockToMemory = (address: string): void => {
  const normalizedAddress = address.toLowerCase()
  MEMORY_VERIFIED_NON_LOCKS[normalizedAddress] = true
}

/**
 * Track lock access frequency for popular locks
 */
export const trackLockAccess = (networkId: string, address: string): void => {
  const key = `${networkId}_${address.toLowerCase()}`
  LOCK_ACCESS_COUNT[key] = (LOCK_ACCESS_COUNT[key] || 0) + 1
}

/**
 * Unified function to check if a contract is a lock across all cache layers
 * Returns from fastest to slowest cache without on-chain verification
 */
export const getLockStatusFromAllCaches = async (
  env: Env,
  networkId: string,
  address: string
): Promise<boolean | null> => {
  const normalizedAddress = address.toLowerCase()

  // 1. First check memory cache (fastest)
  const memoryResult = getLockStatusFromMemory(normalizedAddress)
  if (memoryResult !== null) {
    return memoryResult
  }

  // 2. Then check Cache API
  const cacheApiResult = await getLockFromCacheAPI(networkId, normalizedAddress)
  if (cacheApiResult !== null) {
    // Update memory cache for future checks
    if (cacheApiResult) {
      addVerifiedLockToMemory(normalizedAddress)
      trackLockAccess(networkId, normalizedAddress)
    } else {
      addVerifiedNonLockToMemory(normalizedAddress)
    }
    return cacheApiResult
  }

  // 3. Finally check KV storage
  const kvResult = await getLockFromKV(env, networkId, normalizedAddress)
  if (kvResult !== null) {
    // Update faster caches
    if (kvResult) {
      addVerifiedLockToMemory(normalizedAddress)
      trackLockAccess(networkId, normalizedAddress)
      await storeLockInCacheAPI(networkId, normalizedAddress, true)
    } else {
      addVerifiedNonLockToMemory(normalizedAddress)
      await storeLockInCacheAPI(networkId, normalizedAddress, false)
    }
    return kvResult
  }

  // Not found in any cache
  return null
}

/**
 * Store lock status in all cache layers
 */
export const storeLockStatusInAllCaches = async (
  env: Env,
  networkId: string,
  address: string,
  isLock: boolean
): Promise<void> => {
  const normalizedAddress = address.toLowerCase()

  // Update memory cache
  if (isLock) {
    addVerifiedLockToMemory(normalizedAddress)
    trackLockAccess(networkId, normalizedAddress)
  } else {
    addVerifiedNonLockToMemory(normalizedAddress)
  }

  // Update KV storage
  if (isLock) {
    await storeLockInKV(env, networkId, normalizedAddress)
  } else {
    await storeNonLockInKV(env, networkId, normalizedAddress)
  }

  // Update Cache API
  await storeLockInCacheAPI(networkId, normalizedAddress, isLock)
}

/**
 * Prefill the memory cache on worker startup
 * This reduces KV reads during initial operation
 */
export const prefillLockCache = async (env: Env): Promise<void> => {
  if (!env.LOCK_CACHE) return

  try {
    console.log('Prefilling lock cache from KV storage...')

    // List keys with the lock prefix (limited to 1000 keys by Cloudflare per list operation)
    let keys = await env.LOCK_CACHE.list({ prefix: KV_LOCK_PREFIX })
    let loadedCount = 0

    // Process initial batch of keys
    for (const key of keys.keys) {
      const keyParts = key.name.substring(KV_LOCK_PREFIX.length).split('_')
      if (keyParts.length === 2) {
        const lockAddress = keyParts[1]
        // Add to in-memory cache
        addVerifiedLockToMemory(lockAddress)
        loadedCount++
      }
    }

    // Handle pagination if more than 1000 keys
    // Note: We use list_complete instead of cursor for Cloudflare Workers KV
    while (!keys.list_complete) {
      const lastKey = keys.keys[keys.keys.length - 1].name
      keys = await env.LOCK_CACHE.list({
        prefix: KV_LOCK_PREFIX,
        cursor: lastKey,
      })

      for (const key of keys.keys) {
        const keyParts = key.name.substring(KV_LOCK_PREFIX.length).split('_')
        if (keyParts.length === 2) {
          const lockAddress = keyParts[1]
          addVerifiedLockToMemory(lockAddress)
          loadedCount++
        }
      }
    }

    console.log(`Prefilled lock cache with ${loadedCount} lock addresses`)
  } catch (error) {
    console.error('Error prefilling lock cache:', error)
  }
}
