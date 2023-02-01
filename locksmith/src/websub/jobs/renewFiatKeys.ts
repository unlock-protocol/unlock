import { getKeysToRenew } from '../../graphql/datasource'
import { renewFiatKey } from '../helpers'
import { logger } from '../../logger'
import Normalizer from '../../utils/normalizer'

const FETCH_LIMIT = 25

export async function renewFiatKeys(network: number, within?: number) {
  let page = 0
  while (true) {
    // timeframe to check for renewal
    const end = Math.floor(Date.now() / 1000)
    const start = within ? end - within : undefined

    const keys = await getKeysToRenew({
      start,
      end,
      network,
      page: page ? page * FETCH_LIMIT : 0,
      limit: FETCH_LIMIT,
      minimumLockVersion: 11,
    })

    // If empty, break the loop and return as there are no more new keys to process.
    if (!keys.length) {
      logger.info('No keys to renew for', { network })
      break
    }

    logger.info('Found new keys to renew', {
      keys: keys.map(({ id }) => [network, id]),
    })

    // send all renewal txs
    for (const { tokenId, lock, owner } of keys) {
      try {
        const renewal = await renewFiatKey({
          keyId: Number(tokenId),
          lockAddress: Normalizer.ethereumAddress(lock.address),
          network,
          userAddress: Normalizer.ethereumAddress(owner),
        })
        if (renewal.error) {
          logger.info('Key renewal failed', {
            renewal,
          })
        } else {
          logger.info('Key renewal succeed', {
            renewal,
          })
        }
      } catch (error) {
        logger.error('Renewing key failed', {
          error,
        })
      }
    }
    page += 1
  }
}
