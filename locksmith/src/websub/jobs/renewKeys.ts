import { getKeysToRenew } from '../../graphql/datasource'
import { renewKey } from '../helpers'
import { logger } from '../../logger'

const FETCH_LIMIT = 25

export async function renewKeys(network: number, within?: number) {
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
      minimumLockVersion: 10,
      limit: FETCH_LIMIT,
    })

    // If empty, break the loop and return as there are no more new keys to process.
    if (!keys.length) {
      logger.info(`No keys to renew for ${network}`)
      break
    }

    logger.info('Found new keys to renew', {
      keys: keys.map(({ id }) => [network, id]),
    })

    await Promise.allSettled(
      keys.map(async ({ tokenId, lock }) => {
        try {
          const renewal = await renewKey({
            keyId: tokenId,
            lockAddress: lock.address,
            network,
          })
          if (renewal.error) {
            logger.error('Key renewal failed with error', {
              renewal,
            })
          } else {
            logger.info('Key renewal succeed', {
              renewal,
            })
          }
        } catch (error) {
          logger.error('Renewing key failed threw error', {
            error,
          })
        }
      })
    )
    page += 1
  }
}
