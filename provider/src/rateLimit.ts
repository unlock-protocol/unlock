import { Env } from './types'
import { checkContractTypeOnChain } from './unlockContracts'
import {
  getClientIP,
  hasValidLocksmithSecret,
  getContractAddress,
} from './utils'
import { getContractStatusFromKV, storeContractStatusInKV } from './cache'
import { ContractType } from './types'
import networks from '@unlock-protocol/networks'

interface ApprovedContractsByChain {
  [chainId: string]: {
    [contractAddress: string]: boolean
  }
}

const NON_UNLOCK_APPROVED_CONTRACTS: ApprovedContractsByChain = {
  1: {
    '0x231b0ee14048e9dccd1d247744d114a4eb5e8e63': true, // ENS Resolver
  },
}

// Init!
Object.values(networks).forEach((network) => {
  if (!NON_UNLOCK_APPROVED_CONTRACTS[network.id]) {
    NON_UNLOCK_APPROVED_CONTRACTS[network.id] = {}
  }
  console.log(network.id, NON_UNLOCK_APPROVED_CONTRACTS[network.id])
  network.tokens?.forEach((token) => {
    NON_UNLOCK_APPROVED_CONTRACTS[network.id][token.address.toLowerCase()] =
      true
  })
})

/**
 * Check if a contract should bypass rate limiting because it's an Unlock lock or needed for Unlock to work!
 */
export const isAllowedContract = async (
  contractAddress: string,
  networkId: string,
  env: Env
): Promise<boolean> => {
  if (!contractAddress) return false

  try {
    // First check if contract status is already in cache
    const cachedContractStatus = await getContractStatusFromKV(
      env,
      networkId,
      contractAddress
    )

    // If we have a cached result, return whether it's an Unlock contract
    if (cachedContractStatus !== null) {
      return cachedContractStatus === ContractType.UNLOCK_PROTOCOL_CONTRACT
    }

    // Check if this contract is in the list of non-Unlock approved contracts
    if (
      NON_UNLOCK_APPROVED_CONTRACTS[networkId] &&
      NON_UNLOCK_APPROVED_CONTRACTS[networkId][contractAddress.toLowerCase()]
    ) {
      return true
    }

    // If no cache is found, perform on-chain verification
    const contractStatus = await checkContractTypeOnChain(
      contractAddress,
      networkId,
      env
    )

    // Only store in cache if we have a definitive status (not null or NOT_DEPLOYED)
    if (
      contractStatus !== null &&
      contractStatus !== ContractType.NOT_DEPLOYED
    ) {
      await storeContractStatusInKV(
        env,
        networkId,
        contractAddress,
        contractStatus
      )
    }

    // Return whether it's an Unlock contract
    return contractStatus === ContractType.UNLOCK_PROTOCOL_CONTRACT
  } catch (error) {
    console.error(
      `Error checking if contract is Unlock contract: ${error instanceof Error ? error.message : 'Unknown error'}`
    )

    return false
  }
}

/**
 * Performs rate limiting check using Cloudflare's Rate Limiting API
 * Returns true if the request should be rate limited, false otherwise
 */
export const shouldRateLimitIp = async (
  request: Request,
  method: string,
  env: Env
): Promise<boolean> => {
  // Skip rate limiting if the Locksmith secret is valid
  if (hasValidLocksmithSecret(request, env)) {
    return false
  }

  const ip = getClientIP(request)

  try {
    // Check standard rate limiter (10 seconds period)
    const standardResult = await env.STANDARD_RATE_LIMITER.limit({
      key: `${ip}:${method}`,
    })

    if (!standardResult.success) {
      return true
    }

    // Check hourly rate limiter (60 seconds period)
    const hourlyResult = await env.HOURLY_RATE_LIMITER.limit({ key: ip })

    return !hourlyResult.success
  } catch (error) {
    console.error('Error checking rate limit:', error)
    // In case of error, allow the request to proceed
    // We don't want to block legitimate requests due to rate limiter failures
    return false
  }
}

export const shouldRateLimitSingle = async (
  request: Request,
  env: Env,
  body: any,
  networkId: string
) => {
  const contractAddress = getContractAddress(body.method, body.params)

  if (
    contractAddress &&
    (await isAllowedContract(contractAddress, networkId, env))
  ) {
    // Skip rate limit if this is an Unlock contract
    return false
  }

  // Otherwise rate limit based on IP
  return shouldRateLimitIp(request, body.method, env)
}

/**
 * Rate limit middleware for JSON RPC requests
 * This function checks if the request should be rate limited
 * and considers all "batched" RPC requests in the body
 */
export const shouldRateLimit = async (
  request: Request,
  env: Env,
  body: any,
  networkId: string
) => {
  if (Array.isArray(body)) {
    const shouldRateLimitRequests = await Promise.all(
      body.map((singleBody) =>
        shouldRateLimitSingle(request, env, singleBody, networkId)
      )
    )
    return shouldRateLimitRequests.some(
      (shouldRateLimitRequest) => shouldRateLimitRequest
    )
  }
  return shouldRateLimitSingle(request, env, body, networkId)
}

/**
 * Wrapper function for the new rate limiting interface that's compatible
 * with the refactored code from master branch
 */
export const checkRateLimit = async (
  request: Request,
  method: string | undefined,
  contractAddress: string | null,
  env: Env,
  networkId?: string
): Promise<boolean> => {
  // Skip rate limiting if the Locksmith secret is valid
  if (hasValidLocksmithSecret(request, env)) {
    return true
  }

  if (
    contractAddress &&
    networkId &&
    (await isAllowedContract(contractAddress, networkId, env))
  ) {
    // Skip rate limit if this is an Unlock contract
    return true
  }

  // Use the original rate limiting implementation
  const effectiveMethod = method || 'unknown'
  return !(await shouldRateLimitIp(request, effectiveMethod, env))
}
