import { Env } from './types'
import { checkContractTypeOnChain } from './unlockContracts'
import {
  getClientIP,
  hasValidLocksmithSecret,
  getContractAddress,
} from './utils'

/**
 * Check if a contract should bypass rate limiting because it's an Unlock lock
 * This function determines if rate limiting should be skipped for Unlock lock contracts
 * It performs verification to identify lock contracts
 */
export const isUnlockContract = async (
  contractAddress: string,
  networkId: string,
  env: Env
): Promise<boolean> => {
  if (!contractAddress) return false

  try {
    // Check contract type on-chain
    const isLock = await checkContractTypeOnChain(
      contractAddress,
      networkId,
      env
    )

    return isLock
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
    (await isUnlockContract(contractAddress, networkId, env))
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
    (await isUnlockContract(contractAddress, networkId, env))
  ) {
    // Skip rate limit if this is an Unlock contract
    return true
  }

  // Use the original rate limiting implementation
  const effectiveMethod = method || 'unknown'
  return !(await shouldRateLimitIp(request, effectiveMethod, env))
}
