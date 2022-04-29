import { networks } from '@unlock-protocol/networks'
import { KeysToRenew } from '../../graphql/datasource'
import { renewKey } from '../helpers'
import { logger } from '../../logger'

const FETCH_LIMIT = 25

async function fetchKeysToRenew(network: number, page = 0) {
  const keysSource = new KeysToRenew()

  // timeframe of last 15 min
  const end = Math.floor(Date.now() / 1000)
  const start = end - 60 * 15 // 15 min ago

  const keys = await keysSource.getKeysToRenew(
    start,
    end,
    network,
    page ? page * FETCH_LIMIT : 0 // page
  )
  return keys
}

async function renewKeys(network: number) {
  let page = 0
  while (true) {
    const keys = await fetchKeysToRenew(network, page)

    // If empty, break the loop and return as there are no more new keys to process.
    if (!keys.length) {
      logger.info('No keys to renew for', { network })
      break
    }

    logger.info('Found new keys to renew', {
      keys: keys.map(({ id }) => [network, id]),
    })

    // send all renewal txs
    const promises = await Promise.allSettled(
      keys.map(({ keyId, lock }) =>
        renewKey({
          keyId,
          lockAddress: lock.address,
          network,
        })
      )
    )

    // log errors
    promises.forEach((promise) => {
      if (promise.status === 'rejected') {
        logger.error('Renewing key failed', {
          promise,
        })
      } else {
        logger.info('Key renewed sucessfully', {
          promise,
        })
      }
    })

    page += 1
  }
}

// renew keys on all networks
export async function renewAllKeys() {
  const tasks: Promise<void>[] = []
  for (const network of Object.values(networks)) {
    if (network.id !== 31337) {
      const task = renewKeys(network.id)
      tasks.push(task)
    }
  }
  await Promise.allSettled(tasks)
}
