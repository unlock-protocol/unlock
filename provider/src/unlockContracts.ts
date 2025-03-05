import { Env } from './types'
import supportedNetworks from './supportedNetworks'
import networks from '@unlock-protocol/networks'
import { ethers } from 'ethers'
import { Unlock } from '@unlock-protocol/contracts'
import {
  CACHE_API_TTL,
  KV_LOCK_PREFIX,
  getCacheApiKey,
  createEthersProvider,
} from './utils'

// Local in-memory cache as a fallback and for performance
let KNOWN_LOCK_ADDRESSES: { [address: string]: boolean } = {}

// Access count tracking for high-frequency locks
let LOCK_ACCESS_COUNT: { [key: string]: number } = {}

// Extract just the locks function from the official ABI
const UNLOCK_ABI = [
  Unlock.abi.find(
    (item: { type: string; name?: string; stateMutability?: string }) =>
      item.type === 'function' &&
      item.name === 'locks' &&
      item.stateMutability === 'view'
  ),
]

/**
 * Add an address to the memory cache
 */
const addToMemoryCache = (address: string): void => {
  const normalizedAddress = address.toLowerCase()
  // Add to memory cache
  KNOWN_LOCK_ADDRESSES[normalizedAddress] = true
}

/**
 * Track access of a lock address for frequency-based optimization
 */
const trackLockAccess = (networkId: string, address: string): void => {
  const key = `${networkId}:${address.toLowerCase()}`
  LOCK_ACCESS_COUNT[key] = (LOCK_ACCESS_COUNT[key] || 0) + 1
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
        // Add to in-memory cache without LRU tracking
        addToMemoryCache(lockAddress)
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
          addToMemoryCache(lockAddress)
          loadedCount++
        }
      }
    }

    console.log(`Prefilled lock cache with ${loadedCount} lock addresses`)
  } catch (error) {
    console.error('Error prefilling lock cache:', error)
  }
}

/**
 * Get the Unlock contract address for a specific network
 */
const getUnlockAddress = (networkId: string): string | undefined => {
  const network = networks[networkId]
  return network?.unlockAddress
}

/**
 * Check if an address is a known Unlock contract
 */
export const isKnownUnlockContract = (
  contractAddress: string,
  networkId: string
): boolean => {
  if (!contractAddress) return false

  const normalizedAddress = contractAddress.toLowerCase()
  const unlockAddress = getUnlockAddress(networkId)?.toLowerCase()

  // Check if this is the main Unlock contract
  if (unlockAddress && normalizedAddress === unlockAddress) {
    return true
  }

  // Check if this is a known lock in the in-memory cache
  if (KNOWN_LOCK_ADDRESSES[normalizedAddress]) {
    // Track access for frequency-based optimization
    trackLockAccess(networkId, normalizedAddress)
    return true
  }

  return false
}

/**
 * Check if a lock exists in the Cache API
 */
const getLockFromCacheAPI = async (
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
 * Store a lock in the Cache API
 */
const storeLockInCacheAPI = async (
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

/**
 * Retrieve a lock status from the KV storage
 */
const getLockFromKV = async (
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

    // If the value exists in KV, it means this is a confirmed lock
    return value !== null
  } catch (error) {
    console.error('Error retrieving lock from KV:', error)
    return null
  }
}

/**
 * Store a confirmed lock address in the KV storage
 */
const storeLockInKV = async (
  env: Env,
  networkId: string,
  lockAddress: string
): Promise<void> => {
  if (!env.LOCK_CACHE) {
    return
  }

  try {
    // Create a unique key combining network ID and address for multi-chain support
    const key = `${KV_LOCK_PREFIX}${networkId}_${lockAddress.toLowerCase()}`
    // Store with value of "1" - we only care about existence, not the value
    await env.LOCK_CACHE.put(key, '1', { expirationTtl: 31536000 }) // Cache for 1 year (effectively permanent)
  } catch (error) {
    console.error('Error storing lock in KV:', error)
  }
}

/**
 * Check if an address is a lock by calling the Unlock contract's `locks` mapping
 */
export const checkIsLock = async (
  lockAddress: string,
  networkId: string,
  env: Env
): Promise<boolean> => {
  const unlockAddress = getUnlockAddress(networkId)

  if (!unlockAddress || !lockAddress) {
    return false
  }

  const normalizedLockAddress = lockAddress.toLowerCase()

  // 1. First check the in-memory cache for best performance
  if (KNOWN_LOCK_ADDRESSES[normalizedLockAddress]) {
    // Track access
    trackLockAccess(networkId, normalizedLockAddress)
    return true
  }

  // 2. Check Cache API for frequently accessed locks
  const cacheApiResult = await getLockFromCacheAPI(
    networkId,
    normalizedLockAddress
  )
  if (cacheApiResult === true) {
    // Add to in-memory cache for future checks
    addToMemoryCache(normalizedLockAddress)
    trackLockAccess(networkId, normalizedLockAddress)
    return true
  }

  // 3. Then check the KV storage for persistent cache across restarts
  const kvResult = await getLockFromKV(env, networkId, normalizedLockAddress)
  if (kvResult === true) {
    // Add to in-memory cache for future checks
    addToMemoryCache(normalizedLockAddress)

    // Also cache in Cache API for faster subsequent access
    await storeLockInCacheAPI(networkId, normalizedLockAddress, true)

    trackLockAccess(networkId, normalizedLockAddress)
    return true
  }

  try {
    // Get the provider URL for this network
    const providerUrl = supportedNetworks(env, networkId)
    if (!providerUrl) {
      console.warn(`No provider URL found for network ${networkId}`)
      return false
    }

    // Create ethers provider and contract instance
    const provider = createEthersProvider(providerUrl)
    const unlockContract = new ethers.Contract(
      unlockAddress,
      UNLOCK_ABI,
      provider
    )

    // Add a 5 second timeout to the provider request
    const timeoutPromise = new Promise<boolean>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 5000)
    })

    // Call the locks function to check if this address is a deployed lock
    const lockPromise = unlockContract
      .locks(normalizedLockAddress)
      .then(([deployed]: [boolean]) => {
        // If it's a lock, add it to our caches
        if (deployed) {
          // Add to in-memory cache without LRU tracking
          addToMemoryCache(normalizedLockAddress)

          // Add to persistent KV storage
          storeLockInKV(env, networkId, normalizedLockAddress)

          // Add to Cache API for faster access
          storeLockInCacheAPI(networkId, normalizedLockAddress, true)

          // Track access frequency
          trackLockAccess(networkId, normalizedLockAddress)
        }
        return deployed
      })

    // Race between the actual request and the timeout
    return await Promise.race([lockPromise, timeoutPromise])
  } catch (error) {
    console.error(`Error checking if ${lockAddress} is a lock:`, error)

    // Return false on error - better to rate limit than to allow unbounded access
    return false
  }
}
