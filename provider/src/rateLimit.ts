import { Env } from './types'
import { isKnownUnlockContract, checkIsLock } from './unlockContracts'

/**
 * Checks if the request has the correct Locksmith secret key
 */
export const hasValidLocksmithSecret = (
  request: Request,
  env: Env
): boolean => {
  try {
    if (!env.LOCKSMITH_SECRET_KEY) return false

    // Get the secret from the query parameter
    const url = new URL(request.url)
    const secret = url.searchParams.get('secret')

    // Check if the secret matches
    return secret === env.LOCKSMITH_SECRET_KEY
  } catch (error) {
    console.error('Error checking Locksmith secret:', error)
    return false
  }
}

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
    // TODO: checkf if this is _any_ known contract (lock or Unlock)
    if (isKnownUnlockContract(contractAddress, networkId)) {
      return true
    }

    // Only if a contract is unknown, check if it's a lock and then keep
    // track of it!
    return checkIsLock(contractAddress, networkId, env)
  } catch (error) {
    console.error('Error checking if contract is Unlock contract:', error)
    return false
  }
}

/**
 * Extract the client IP address from the request
 * This function supports Cloudflare-specific headers to get the real client IP
 */
export const getClientIP = (request: Request): string => {
  try {
    // Try to get the IP from CF-Connecting-IP header (set by Cloudflare)
    const cfConnectingIP = request.headers.get('CF-Connecting-IP')
    if (cfConnectingIP) {
      return cfConnectingIP
    }

    // Fallback to X-Forwarded-For header
    const forwardedFor = request.headers.get('X-Forwarded-For')
    if (forwardedFor) {
      // X-Forwarded-For can contain multiple IPs, use the first one which is the client
      return forwardedFor.split(',')[0].trim()
    }

    // Generate a unique identifier based on CF-Ray ID or request properties
    const cfRayId = request.headers.get('CF-Ray')
    if (cfRayId) {
      return `unknown-ip-${cfRayId}`
    }

    // Final fallback - generate a fingerprint from request details
    // Use the URL, method, and a timestamp to create a somewhat unique identifier
    const requestFingerprint = `${request.url}-${request.method}-${Date.now()}`
    return `unknown-ip-${requestFingerprint.slice(0, 32)}`
  } catch (error) {
    console.error('Error extracting client IP:', error)
    return `error-ip-${Date.now()}`
  }
}

/**
 * Performs rate limiting check using Cloudflare's Rate Limiting API
 * Returns true if the request should be allowed, false otherwise
 */
export const checkRateLimit = async (
  request: Request,
  method: string,
  contractAddress: string | null,
  env: Env
): Promise<boolean> => {
  // Authenticated Locksmith requests are exempt from rate limiting
  if (hasValidLocksmithSecret(request, env)) {
    return true
  }

  // Get client IP for rate limiting
  const ip = getClientIP(request)

  try {
    // Create a key that combines IP with contract address or method to provide granular rate limiting
    // This is a more stable identifier than just IP alone, as recommended by Cloudflare
    const rateKey =
      contractAddress && typeof contractAddress === 'string'
        ? `${ip}:${contractAddress.toLowerCase()}`
        : `${ip}:${method}`

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

/**
 * Extract contract address from RPC method params
 * This function supports common RPC methods that interact with contracts
 */
export const getContractAddress = (
  method: string,
  params: any[]
): string | null => {
  if (!params || params.length === 0) return null

  try {
    // Common RPC methods that interact with contracts directly with 'to' field
    if (
      ['eth_call', 'eth_estimateGas', 'eth_sendTransaction'].includes(method)
    ) {
      const txParams = params[0]
      if (txParams && typeof txParams === 'object' && 'to' in txParams) {
        const address = txParams.to
        return typeof address === 'string' ? address : null
      }
    }

    // eth_getLogs and eth_getFilterLogs may contain contract address in 'address' field
    if (['eth_getLogs', 'eth_getFilterLogs'].includes(method)) {
      const filterParams = params[0]
      if (
        filterParams &&
        typeof filterParams === 'object' &&
        'address' in filterParams
      ) {
        const address = filterParams.address
        return typeof address === 'string' ? address : null
      }
    }

    // eth_getCode, eth_getBalance, eth_getTransactionCount, eth_getStorageAt
    // These methods have the address as the first parameter
    if (
      [
        'eth_getCode',
        'eth_getBalance',
        'eth_getTransactionCount',
        'eth_getStorageAt',
      ].includes(method)
    ) {
      if (typeof params[0] === 'string') {
        return params[0]
      }
    }

    return null
  } catch (error) {
    console.error(
      `Error extracting contract address from method ${method}:`,
      error
    )
    return null
  }
}

const shouldRateLimitSingle = async (
  request: Request,
  env: Env,
  body: any,
  networkId: string
) => {
  // Extract contract address if applicable
  const contractAddress = getContractAddress(body.method, body.params)
  if (!contractAddress) {
    // If we can't determine the contract address, allow the request to proceed
    return false
  }

  // Check if this is an Unlock contract (skip rate limiting if true)
  if (await isUnlockContract(contractAddress, networkId, env)) {
    return false
  }

  console.log(`Not an Unlock contract: ${contractAddress}`)

  // TODO: consider applying strict rate limiting for all requests
  // Would that apply to ERC20 contracts as well?
  try {
    return checkRateLimit(request, body.method, contractAddress, env)
  } catch (error) {
    console.error('Error checking rate limits:', error)
    // On error, allow the request to proceed rather than blocking legitimate traffic
    return false
  }
}

/**
 * Rate limit middleware for JSON RPC requests
 * This function checks if the request should be rate limited
 * If the request should be blocked, it returns a 429 response
 * Otherwise, it calls the next middleware in the chain
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
  } else {
    return shouldRateLimitSingle(request, env, body, networkId)
  }
}
