import { ContractType, Env, RpcRequest } from './types'
import { getKVContractTypeKey, generateENSCacheKey, getCacheTTL } from './utils'

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
 * Get a cached ENS/Basename response from KV storage
 * @param request The RPC request
 * @param networkId The network ID
 * @param env The environment variables
 * @returns The cached response or null if not found
 *
 * First attempts to retrieve and parse as JSON directly. If that fails,
 * falls back to retrieving as text and parsing manually. If the text
 * parsing also fails, deletes the corrupted cache entry.
 */
export const getENSResponseFromKV = async (
  request: RpcRequest,
  networkId: string,
  env: Env
): Promise<any> => {
  if (!env.NAME_RESOLUTION_CACHE) {
    return null
  }

  const cacheKey = generateENSCacheKey(request, networkId)

  try {
    // Try to get and parse as JSON
    const cached = await env.NAME_RESOLUTION_CACHE.get(cacheKey, 'json')
    if (cached) {
      return cached
    }
  } catch (error) {
    // If JSON parsing fails, try simple text retrieval and parse it
    try {
      const rawText = await env.NAME_RESOLUTION_CACHE.get(cacheKey, 'text')
      if (rawText) {
        try {
          return JSON.parse(rawText)
        } catch {
          // If still can't parse, delete the corrupted entry
          await env.NAME_RESOLUTION_CACHE.delete(cacheKey).catch(() => {})
        }
      }
    } catch (error) {
      console.error(
        `Error reading from ENS cache: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  return null
}

/**
 * Cache an ENS/Basename response
 * @param request The RPC request
 * @param response The response to cache
 * @param networkId The network ID
 * @param env The environment variables
 */
export const storeENSResponseInKV = async (
  request: RpcRequest,
  response: any,
  networkId: string,
  env: Env
): Promise<void> => {
  if (!env.NAME_RESOLUTION_CACHE || !response?.result) {
    return
  }

  const cacheKey = generateENSCacheKey(request, networkId)
  const ttl = getCacheTTL(env)

  try {
    // Only store the result, not the full RPC response
    const cacheValue = { result: response.result }
    await env.NAME_RESOLUTION_CACHE.put(cacheKey, JSON.stringify(cacheValue), {
      expirationTtl: ttl,
    })
  } catch (error) {
    console.error(
      `Error writing to ENS cache: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}
