import { Env } from './types'
import supportedNetworks from './supportedNetworks'
import networks from '@unlock-protocol/networks'
import { ethers } from 'ethers'
import { Unlock } from '@unlock-protocol/contracts'
import { createEthersProvider } from './utils'

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
  return networks[networkId]?.unlockAddress?.toLowerCase()
}

/**
 * Check if a contract is deployed at the given address
 * This is a pure verification function with no caching
 */
const isContractDeployed = async (
  provider: ethers.Provider,
  address: string
): Promise<boolean> => {
  try {
    const code = await provider.getCode(address)
    // If the code is just '0x', there's no contract at this address
    return code !== '0x'
  } catch (error) {
    console.error(
      `Error checking if contract is deployed at ${address}:`,
      error
    )
    return false
  }
}

/**
 * Verify if an address is a lock
 * This is a pure verification function
 */
const verifyLockOnChain = async (
  provider: ethers.Provider,
  unlockAddress: string,
  lockAddress: string
): Promise<boolean> => {
  try {
    // Create a contract instance for the Unlock contract
    const unlockContract = new ethers.Contract(
      unlockAddress,
      UNLOCK_ABI,
      provider
    )

    // Call the locks function to get lock details
    const lockData = await unlockContract.locks(lockAddress)
    // Check the 'deployed' property to determine if this is a valid lock
    return lockData.deployed
  } catch (error) {
    console.error(
      `Error verifying lock ${lockAddress} on chain:`,
      error instanceof Error ? error.message : 'Unknown error'
    )
    return false
  }
}

/**
 * Checks if a contract is an Unlock contract
 */
export const checkContractTypeOnChain = async (
  lockAddress: string,
  networkId: string,
  env: Env
): Promise<boolean> => {
  if (!lockAddress) {
    return false
  }

  const normalizedLockAddress = lockAddress.toLowerCase()
  const unlockAddress = getUnlockAddress(networkId)

  if (!unlockAddress) {
    console.warn(`No Unlock address found for network ${networkId}`)
    return false
  }

  try {
    // Get the provider URL for this network
    const providerUrl = supportedNetworks(env, networkId)
    if (!providerUrl) {
      console.warn(`No provider URL found for network ${networkId}`)
      return false
    }

    // Create ethers provider
    const provider = createEthersProvider(providerUrl)

    // First check if the contract is deployed and verify if it's an Unlock lock
    return await isContractDeployed(provider, normalizedLockAddress).then(
      async (isDeployed) => {
        if (!isDeployed) {
          return false
        }
        return verifyLockOnChain(provider, unlockAddress, normalizedLockAddress)
      }
    )
  } catch (error) {
    console.error(`Error checking if ${lockAddress} is a lock:`, error)
    // Return false on error
    return false
  }
}
