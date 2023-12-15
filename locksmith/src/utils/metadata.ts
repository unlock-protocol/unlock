import config from '../config/config'
import { SubgraphService } from '@unlock-protocol/unlock-js'
import logger from '../logger'
import { waitOrTimeout } from './promises'
import { TIMEOUT_ON_SUBGRAPH } from './constants'

interface Options {
  lockAddress: string
  network: number
}

// Do we need this?
// We are already making a request to the subgraoh upstream... so that seems wasteful
export const getDefaultLockData = async ({ lockAddress, network }: Options) => {
  const defaultLockData = {
    name: 'Unlock Lock',
    description:
      'This is a lock created using contracts from Unlock Labs. Unlock is a protocol for memberships. https://unlock-protocol.com/',
    image: `${config.services.locksmith}/lock/${lockAddress}/icon`,
    external_url: null,
    attributes: [],
  }
  try {
    const subgraphClient = new SubgraphService()
    const lock = await waitOrTimeout(
      subgraphClient.lock(
        {
          where: {
            address: lockAddress.toLowerCase(),
          },
        },
        {
          network,
        }
      ),
      TIMEOUT_ON_SUBGRAPH,
      () => {
        logger.error(
          `Timed out after ${TIMEOUT_ON_SUBGRAPH}ms while retrieving info from Subgraph for lock metadata ${lockAddress} on ${network}`
        )
        // Return the default
        return defaultLockData
      }
    )
    return {
      name: lock.name,
      description: `${lock.name} is a lock created using contracts from Unlock Labs. Unlock is a protocol for memberships. https://unlock-protocol.com/`,
      image: `${config.services.locksmith}/lock/${lockAddress}/icon`,
      attributes: [],
      external_url: null,
    }
  } catch (error) {
    logger.error(error)
    return defaultLockData
  }
}
