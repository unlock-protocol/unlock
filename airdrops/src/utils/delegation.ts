import { ethers } from 'ethers'
import { getProvider } from './provider'

/**
 * Checks if an address is has delegated their tokens to another address
 * Returns true if the address has delegated tokens, false otherwise
 */
export const hasDelegated = async (
  address: string,
  tokenAddress: string,
  chainId: number
): Promise<boolean> => {
  try {
    const provider = getProvider(chainId)
    const delegationAbi = ['function delegates(address) view returns (address)']
    const tokenContract = new ethers.Contract(
      tokenAddress,
      delegationAbi,
      provider
    )
    const delegate = await tokenContract.delegates(address)
    return delegate !== ethers.ZeroAddress
  } catch (error) {
    console.error('Error checking delegation status:', error)
    return false
  }
}
