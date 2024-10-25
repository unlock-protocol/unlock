import { randomUUID } from 'crypto'
import { CheckoutConfig } from '../models'
import { PaywallConfig } from '@unlock-protocol/core'
import { Web3Service } from '@unlock-protocol/unlock-js'
import networks from '@unlock-protocol/networks'

const web3Service = new Web3Service(networks)

interface SaveCheckoutConfigArgs {
  id?: string
  name: string
  createdBy: string
  config: any // TODO: TYPE
}

/**
 * Extracts lock addresses and network information from the config
 * @param config - The checkout configuration object
 * @returns An array of objects containing lock address and network
 */
const extractLockInfo = (
  config: any
): { address: string; network: number }[] => {
  const defaultNetwork = config.network
  return Object.entries(config.locks).map(
    ([address, lockConfig]: [string, any]) => ({
      address,
      network: lockConfig.network || defaultNetwork,
    })
  )
}

/**
 * Checks if a user is a manager for a given lock
 * @param lockAddress - The address of the lock
 * @param userAddress - The address of the user
 * @param network - The network ID
 * @returns A boolean indicating whether the user is a lock manager
 */
const isLockManager = async (
  lockAddress: string,
  userAddress: string,
  network: number
): Promise<boolean> => {
  try {
    return await web3Service.isLockManager(lockAddress, userAddress, network)
  } catch (error) {
    console.error(`Error checking lock manager status: ${error}`)
    return false
  }
}

/**
 * Determines if a user is authorized to manage a checkout config
 * @param userAddress - The address of the user
 * @param checkoutConfig - The checkout configuration object
 * @returns A boolean indicating whether the user is authorized
 */
const isUserAuthorized = async (
  userAddress: string,
  checkoutConfig: CheckoutConfig
): Promise<boolean> => {
  // first check if user is the creator
  if (checkoutConfig.createdBy === userAddress) {
    return true
  }

  const lockInfo = extractLockInfo(checkoutConfig.config)
  for (const { address, network } of lockInfo) {
    if (await isLockManager(address, userAddress, network)) {
      return true
    }
  }

  return false
}

/**
 * Creates or updates a checkout configuration
 * @param args - The SaveCheckoutConfigArgs object
 * @returns The created or updated checkout configuration
 */
export const saveCheckoutConfig = async ({
  id,
  name,
  createdBy,
  config,
}: SaveCheckoutConfigArgs) => {
  const generatedId = id || randomUUID()

  const checkoutConfigData = await PaywallConfig.strip().parseAsync(config)

  // Ensure referrer is set to the creator
  if (!checkoutConfigData.referrer) {
    checkoutConfigData.referrer = createdBy
  }

  const [createdConfig] = await CheckoutConfig.upsert(
    {
      id: generatedId,
      name,
      config: checkoutConfigData,
      createdBy,
    },
    {
      conflictFields: ['id'],
    }
  )
  return createdConfig
}

/**
 * Retrieves a checkout configuration by its ID
 * @param id - The ID of the checkout configuration
 * @returns The checkout configuration object or null if not found
 */
export const getCheckoutConfigById = async (id: string) => {
  const checkoutConfig = await CheckoutConfig.findOne({
    where: {
      id,
    },
  })
  if (checkoutConfig) {
    return {
      id: checkoutConfig.id,
      name: checkoutConfig.name,
      by: checkoutConfig.createdBy,
      config: checkoutConfig.config,
      updatedAt: checkoutConfig.updatedAt.toISOString(),
      createdAt: checkoutConfig.createdAt.toISOString(),
    }
  }
  return null
}

/**
 * Checks if a user is authorized to manage a specific checkout config
 * @param userAddress - The address of the user
 * @param configId - The ID of the checkout configuration
 * @returns A boolean indicating whether the user is authorized
 */
export const isAuthorizedToManageConfig = async (
  userAddress: string,
  configId: string
): Promise<boolean> => {
  const checkoutConfig = await CheckoutConfig.findOne({
    where: {
      id: configId,
    },
  })
  if (!checkoutConfig) {
    return false
  }
  return isUserAuthorized(userAddress, checkoutConfig)
}

export const getCheckoutConfigsByUserOperation = async (
  userAddress: string
) => {
  return await CheckoutConfig.findAll({
    where: {
      createdBy: userAddress,
    },
    order: [['updatedAt', 'DESC']],
  })
}

/**
 * Deletes a checkout configuration if the user is authorized
 * @param userAddress - The address of the user
 * @param configId - The ID of the checkout configuration
 * @returns A boolean indicating whether the deletion was successful
 */
export const deleteCheckoutConfigOperation = async (
  userAddress: string,
  configId: string
): Promise<boolean> => {
  const checkoutConfig = await CheckoutConfig.findOne({
    where: {
      id: configId,
    },
  })

  if (!checkoutConfig) {
    return false
  }

  const authorized = await isUserAuthorized(userAddress, checkoutConfig)

  if (!authorized) {
    return false
  }

  await checkoutConfig.destroy()
  return true
}
