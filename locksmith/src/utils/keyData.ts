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
      key.owner = owner

      const lock = await web3Service.getLock(lockAddress, network)
      let expiration: number | undefined

      if (lock.publicLockVersion >= 10) {
        expiration = await web3Service.getKeyExpirationByTokenId(
          lockAddress,
          tokenId,
          network
        )
      } else {
        expiration = await web3Service.getKeyExpirationByLockForOwner(
          lockAddress,
          owner,
          network
        )
      }

      key.expiration = expiration

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
