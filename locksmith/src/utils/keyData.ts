import { SubgraphService } from '@unlock-protocol/unlock-js'
import logger from '../logger'
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
      const data = {
        expiration: parseInt(key?.expiration),
        tokenId: key?.tokenId,
        owner: key?.owner,
      }
      return data
    } catch (error) {
      logger.error(
        `There was an error retrieving info for metadata ${lockAddress} ${tokenId} on ${network}`,
        error
      )
      return
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
