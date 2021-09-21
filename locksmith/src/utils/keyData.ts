import { Web3Service } from '@unlock-protocol/unlock-js'
import networks from '@unlock-protocol/networks'

import logger from '../logger'


export default class KeyData {
  async get(lockAddress: string, tokenId: string, network: number) {
    const web3Service = new Web3Service(networks)
    try {
      const owner = await web3Service.ownerOf(lockAddress, tokenId, network)
      if (!owner) {
        return {}
      }
      const expiration = await web3Service.getKeyExpirationByLockForOwner(
        lockAddress,
        owner,
        network
      )
      return {
        owner,
        expiration,
      }
    } catch (error) {
      logger.error(
        `There was an error retrieving info for metadata ${lockAddress} ${tokenId} on ${network}`,
        error
      )
      return {}
    }
  }

  openSeaPresentation(data: any) {
    return {
      attributes: [
        {
          trait_type: 'Expiration',
          value: data.expiration || 0,
          display_type: 'date',
        },
      ],
    }
  }
}
