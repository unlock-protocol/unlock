import { Web3Service } from '@unlock-protocol/unlock-js'
import networks from '@unlock-protocol/networks'

import logger from '../logger'

interface Key {
  owner?: string
  expiration?: number
}
export default class KeyData {
  async get(lockAddress: string, tokenId: string, network: number) {
    const web3Service = new Web3Service(networks)
    const key: Key = {}

    try {
      const owner = await web3Service.ownerOf(lockAddress, tokenId, network)
      if (!owner) {
        return {}
      }
      const lock = await web3Service.getLock(lockAddress, network)
      if (lock.publicLockVersion >= 10) {
        key.expiration = await web3Service.getKeyExpirationByTokenId(
          lockAddress,
          tokenId,
          network
        )
      } else {
        key.expiration = await web3Service.getKeyExpirationByLockForOwner(
          lockAddress,
          owner,
          network
        )
      }
      key.owner = owner
      return key
    } catch (error) {
      logger.error(
        `There was an error retrieving info for metadata ${lockAddress} ${tokenId} on ${network}`,
        error
      )
      return key
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
