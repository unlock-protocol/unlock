import { Env } from './types'
import { isKnownUnlockContract, checkIsLock } from './unlockContracts'
import { getClientIP, hasValidLocksmithSecret } from './utils'

/**
 * Check if a contract is an Unlock contract
 * This uses a multi-step approach:
 * 1. Check if it's a known Unlock contract address
 * 2. If not, check if it's a lock by calling the Unlock contract
 */
export const isUnlockContract = async (
  contractAddress: string,
  networkId: string,
  env: Env
): Promise<boolean> => {
  if (!contractAddress) return false

  try {
    // First, check if it's a known Unlock contract
    if (isKnownUnlockContract(contractAddress, networkId)) {
      return true
    }

    // If not a known Unlock contract, check if it's a lock
    const isLock = await checkIsLock(contractAddress, networkId, env)
    return isLock
  } catch (error) {
    console.error(
      `Error checking if contract is Unlock contract: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
    return false
  }
}

/**
 * Check if a request should be rate limited
 * Returns true if the request is allowed, false if it should be limited
 */
export const checkRateLimit = async (
  request: Request,
  method: string | undefined,
  contractAddress: string | null,
  env: Env
): Promise<boolean> => {
  // Skip rate limiting if the Locksmith secret is valid
  if (hasValidLocksmithSecret(request, env)) {
    return true
  }

  const ip = getClientIP(request)

  try {
    // Create a key that combines IP with contract address or method to provide granular rate limiting
    // This is a more stable identifier than just IP alone, as recommended by Cloudflare
    const rateKey =
      contractAddress && typeof contractAddress === 'string'
        ? `${ip}:${contractAddress.toLowerCase()}`
        : `${ip}:${method || 'unknown'}`

    // Check standard rate limiter (10 seconds period)
    const standardResult = await env.STANDARD_RATE_LIMITER.limit({
      key: rateKey,
    })
    if (!standardResult.success) {
      return false
    }

    // Check hourly rate limiter (60 seconds period)
    const hourlyResult = await env.HOURLY_RATE_LIMITER.limit({ key: ip })
    return hourlyResult.success
  } catch (error) {
    console.error('Error checking rate limit:', error)
    // In case of error, allow the request to proceed
    // We don't want to block legitimate requests due to rate limiter failures
    return true
  }
}
