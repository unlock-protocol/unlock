import { Op } from 'sequelize'
import { networks } from '@unlock-protocol/networks'
import { KeysToRenew } from '../../graphql/datasource'
import { KeyRenewal } from '../../models'
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

  const keyIds = keys.map(({ id }) => id)
  const lockAddresses = keys.map(({ lock }) => lock.address)
  const processedKeys = await KeyRenewal.findAll({
    where: {
      [Op.and]: {
        keyId: {
          [Op.in]: keyIds,
        },
        lockAddress: {
          [Op.in]: lockAddresses,
        },
      },
    },
  })

  const unprocessedKeys = keys.filter(
    (key: any) =>
      !processedKeys.find(
        ({ keyId, lockAddress }) =>
          keyId === key.id && lockAddress === key.lock.address
      )
  )

  return unprocessedKeys
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
      keys: keys.map(({ id, lock }) => [network, lock.address, id]),
    })

    // send all renewal txs
    const promises = await Promise.allSettled(
      keys.map(({ id, lock }) =>
        renewKey({
          keyId: id,
          lockAddress: lock.address,
          network,
        })
      )
    )

    // log errors
    promises
      .filter((promise) => promise.status === 'rejected')
      .forEach((promise) => {
        logger.info('Renewing key failed', {
          promise,
        })
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
