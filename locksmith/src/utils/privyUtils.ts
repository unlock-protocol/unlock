import logger from '../logger'
import { privy } from './privyClient'

/**
 * Helper function to get user's email address from Privy
 * @param address - Wallet address to lookup
 * @returns Email address if found, null otherwise
 */
export async function getUserEmailFromPrivy(
  address: string
): Promise<string | null> {
  if (!privy) {
    logger.error('Privy client not initialized')
    return null
  }

  try {
    const user = await privy.getUserByWalletAddress(address)
    return user?.email?.address || null
  } catch (error) {
    logger.error('Failed to fetch user email from Privy:', error)
    return null
  }
}
