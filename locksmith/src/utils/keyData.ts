import { SubgraphService } from '@unlock-protocol/unlock-js'
import logger from '../logger'
import { ethers } from 'ethers'
import { Attribute } from '../types'
import { waitOrTimeout } from './promises'
import { TIMEOUT_ON_SUBGRAPH } from './constants'

interface Key {
  expiration?: number
  minted?: number
  tokenId: string
  owner: string
}

export default class KeyData {
  async get(lockAddress: string, tokenId: string, network: number) {
    try {
      const subgraphClient = new SubgraphService()
      const key = await waitOrTimeout(
        subgraphClient.key(
          {
            where: {
              lock: lockAddress.toLowerCase(),
              tokenId: Number(tokenId),
            },
          },
          {
            network,
          }
        ),
        TIMEOUT_ON_SUBGRAPH,
        () => {
          logger.error(
            `Timed out after ${TIMEOUT_ON_SUBGRAPH}ms while retrieving info from Subgraph for metadata ${lockAddress} ${tokenId} on ${network}`
          )
          return {}
        }
      )

      let keyExpiration = key?.expiration

      // If max uint, then there is no expiration
      if (keyExpiration && keyExpiration === ethers.MaxUint256.toString()) {
        keyExpiration = undefined
      }

      const data: Key = {
        expiration: keyExpiration ? parseInt(keyExpiration) : undefined,
        tokenId: key?.tokenId,
        owner: key?.owner,
        minted: key?.createdAt ? parseInt(key.createdAt) : undefined,
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
    if (data.minted) {
      attributes.push({
        trait_type: 'Minted',
        display_type: 'date',
        value: data.minted,
      })
    }
    return {
      attributes,
    }
  }
}
