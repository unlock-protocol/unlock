import { Env } from './types'
import supportedNetworks from './supportedNetworks'
import networks from '@unlock-protocol/networks'
import { ethers } from 'ethers'
import { Unlock } from '@unlock-protocol/contracts'

// Local in-memory cache as a fallback and for performance
let KNOWN_LOCK_ADDRESSES: { [address: string]: boolean } = {}

// Key prefix for KV storage to avoid collisions
const KV_LOCK_PREFIX = 'lock_'

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
    return true
  }

  return false
}

/**
 * Create an ethers provider from the RPC URL
 */
const createEthersProvider = (rpcUrl: string): ethers.JsonRpcProvider => {
  return new ethers.JsonRpcProvider(rpcUrl)
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

  // First check the in-memory cache for best performance
  if (KNOWN_LOCK_ADDRESSES[normalizedLockAddress]) {
    return true
  }

  // Then check the KV storage for persistent cache across restarts
  const kvResult = await getLockFromKV(env, networkId, normalizedLockAddress)
  if (kvResult === true) {
    // Add to in-memory cache for future checks
    KNOWN_LOCK_ADDRESSES[normalizedLockAddress] = true
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
          // Add to in-memory cache
          KNOWN_LOCK_ADDRESSES[normalizedLockAddress] = true

          // Add to persistent KV storage
          storeLockInKV(env, networkId, normalizedLockAddress)
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
