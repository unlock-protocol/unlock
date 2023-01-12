import { SubgraphService } from '@unlock-protocol/unlock-js'
import logger from '../logger'
import { ethers } from 'ethers'
import { Attribute } from '../types'

interface Key {
  expiration?: number
  tokenId: string
  owner: string
}

export default class KeyData {
  async get(lockAddress: string, tokenId: string, network: number) {
    try {
      const subgraphClient = new SubgraphService()
      const key = await subgraphClient.key(
        {
          where: {
            lock: lockAddress.toLowerCase(),
            tokenId: Number(tokenId),
          },
        },
        {
          network,
        }
      )

      let keyExpiration = key?.expiration

      // If max uint, then there is no expiration
      if (
        keyExpiration &&
        keyExpiration === ethers.constants.MaxUint256.toString()
      ) {
        keyExpiration = undefined
      }

      const data: Key = {
        expiration: keyExpiration ? parseInt(keyExpiration) : undefined,
        tokenId: key?.tokenId,
        owner: key?.owner,
      }

      return data
    } catch (error) {
      logger.error(
        `There was an error retrieving info for metadata ${lockAddress} ${tokenId} on ${network}`,
        error
      )
      return {} as Key
    }
  }

  openSeaPresentation(data: Partial<Key>) {
    const attributes: Attribute[] = []
    if (data.expiration) {
      attributes.push({
        trait_type: 'Expiration',
        display_type: 'date',
        value: data.expiration,
      })
    }
    return {
      attributes,
    }
  }
}
