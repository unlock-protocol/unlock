import config from '../config/config'
import { subgraph } from '../config/subgraph'
import logger from '../logger'

interface Options {
  lockAddress: string
  network: number
}

export const getDefaultLockData = async ({ lockAddress, network }: Options) => {
  try {
    const lock = await subgraph.lock(
      {
        where: {
          address: lockAddress.toLowerCase(),
        },
      },
      {
        network,
      }
    )
    return {
      name: lock.name,
      description: `${lock.name} is a lock created using contracts from Unlock Labs. Unlock is a protocol for memberships. https://unlock-protocol.com/`,
      image: `${config.services.locksmith}/lock/${lockAddress}/icon`,
    }
  } catch (error) {
    logger.error(error)
    return {
      name: 'Unlock Lock',
      description:
        'This is a lock created using contracts from Unlock Labs. Unlock is a protocol for memberships. https://unlock-protocol.com/',
      image: `${config.services.locksmith}/lock/${lockAddress}/icon`,
    }
  }
}
