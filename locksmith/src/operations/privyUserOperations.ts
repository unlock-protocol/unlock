import { privy } from '../utils/privyClient'
import logger from '../logger'

interface PrivyUserResponse {
  success: boolean
  user: any | null
  error?: string
}

/**
 * Get Privy user by email address
 * @param email - Email address to lookup
 */
export const getPrivyUserByEmail = async (
  email: string
): Promise<PrivyUserResponse> => {
  if (!privy) {
    return {
      success: false,
      user: null,
      error: 'Privy client not initialized',
    }
  }

  try {
    const user = await privy.getUserByEmail(email)
    return {
      success: true,
      user: user || null,
    }
  } catch (error) {
    logger.error('Failed to fetch Privy user by email:', error)
    return {
      success: false,
      user: null,
      error: 'Failed to fetch user from Privy',
    }
  }
}

/**
 * Get Privy user by wallet address
 * @param address - Ethereum wallet address to lookup
 */
export const getPrivyUserByAddress = async (
  address: string
): Promise<PrivyUserResponse> => {
  if (!privy) {
    return {
      success: false,
      user: null,
      error: 'Privy client not initialized',
    }
  }

  try {
    const user = await privy.getUserByWalletAddress(address)
    return {
      success: true,
      user: user || null,
    }
  } catch (error) {
    logger.error('Failed to fetch Privy user by wallet address:', error)
    return {
      success: false,
      user: null,
      error: 'Failed to fetch user from Privy',
    }
  }
}
