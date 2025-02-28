import { Env } from './types'
import { isKnownUnlockContract, checkIsLock } from './unlockContracts'

/**
 * Checks if the given IP is in the Locksmith allowlist
 */
export const isLocksmithIP = (ip: string, env: Env): boolean => {
  if (!env.LOCKSMITH_IPS) return false

  const allowlistedIPs = env.LOCKSMITH_IPS.split(',').map((ip) => ip.trim())
  return allowlistedIPs.includes(ip)
}

/**
 * Get client IP from request
 */
export const getClientIP = (request: Request): string => {
  return (
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for') ||
    'unknown'
  )
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
    // First, check if it's a known Unlock contract
    if (isKnownUnlockContract(contractAddress, networkId)) {
      return true
    }

    // If not a known Unlock contract, check if it's a lock
    return await checkIsLock(contractAddress, networkId, env)
  } catch (error) {
    console.error('Error checking if contract is Unlock contract:', error)
    return false
  }
}

/**
 * Performs rate limiting check using Cloudflare's Rate Limiting API
 * Returns true if the request should be allowed, false otherwise
 */
export const checkRateLimit = async (
  ip: string,
  method: string,
  contractAddress: string | null,
  env: Env
): Promise<boolean> => {
  // Locksmith IPs are always allowed
  if (isLocksmithIP(ip, env)) {
    return true
  }

  try {
    // Create a key that combines IP with contract address or method to provide granular rate limiting
    // This is a more stable identifier than just IP alone, as recommended by Cloudflare
    const rateKey = contractAddress
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
        return txParams.to as string
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
        return filterParams.address as string
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
        return params[0] as string
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
