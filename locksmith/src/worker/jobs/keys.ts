import { Op } from 'sequelize'
import { networks } from '@unlock-protocol/networks'
import { Hook, ProcessedHookItem } from '../../models'
import { TOPIC_KEYS_ON_LOCK, TOPIC_KEYS_ON_NETWORK } from '../topics'
import { notifyHook, filterHooksByTopic } from '../helpers'
import { notifyNewKeysToWedlocks } from '../../operations/wedlocksOperations'
import { logger } from '../../logger'
import {
  SubgraphService,
  KeyOrderBy,
  OrderDirection,
} from '@unlock-protocol/unlock-js'

// If this is too high, the memory gets too high and Heroku kills the dyno
const FETCH_LIMIT = 20

// Pages scanned by the daily full scan, which catches keys missed by a failed run.
const FULL_SCAN_PAGES = 12

interface KeysPage {
  // number of keys the subgraph returned for this page
  fetched: number
  // keys on this page that were not processed on an earlier run
  unprocessed: any[]
}

async function fetchUnprocessedKeys(
  network: number,
  page = 0
): Promise<KeysPage> {
  const subgraph = new SubgraphService()
  const skip = page ? page * FETCH_LIMIT : 0
  const oneWeekAgo = Math.floor(new Date().getTime() / 1000) - 7 * 24 * 60 * 60 // 1 week ago in seconds
  try {
    const keys = await subgraph.keys(
      {
        first: FETCH_LIMIT,
        skip,
        orderBy: KeyOrderBy.CreatedAtBlock,
        orderDirection: OrderDirection.Desc,
        where: {
          createdAt_gt: oneWeekAgo,
        },
      },
      {
        networks: [network],
      }
    )

    const keyIds = keys.map((key: any) => key.id)
    const processedKeys = await ProcessedHookItem.findAll({
      where: {
        type: 'key',
        objectId: {
          [Op.in]: keyIds,
        },
      },
    })

    const unprocessedKeys = keys.filter(
      (key: any) => !processedKeys.find((item) => item.objectId === key.id)
    )
    return { fetched: keys.length, unprocessed: unprocessedKeys }
  } catch (error) {
    logger.error('Error fetching unprocessed keys', { network, error })
    return { fetched: 0, unprocessed: [] }
  }
}

async function notifyHooksOfAllUnprocessedKeys(
  hooks: Hook[],
  network: number,
  fullScan: boolean
) {
  let page = 0
  const keysOnLockHooks = filterHooksByTopic(hooks, TOPIC_KEYS_ON_LOCK)
  const keysOnNetworkHooks = filterHooksByTopic(hooks, TOPIC_KEYS_ON_NETWORK)
  while (true) {
    const { fetched, unprocessed: keys } = await fetchUnprocessedKeys(
      network,
      page
    )

    // The full scan keeps paging through the first pages even when they hold
    // no new keys, to catch anything a failed run left behind.
    if (fullScan && !keys.length && page >= FULL_SCAN_PAGES - 1) {
      break
    }

    if (keys.length > 0) {
      logger.info('Found new keys', {
        keys: keys.map((key: any) => [network, key.lock.address, key.id]),
      })

      await notifyNewKeysToWedlocks(keys, network) // send emails when applicable!

      for (let i = 0; i < keysOnLockHooks.length; i++) {
        const keysOnLockHook = keysOnLockHooks[i]
        const data = keys.filter(
          (key: any) => key.lock.id === keysOnLockHook.lock
        )
        await notifyHook(keysOnLockHook, {
          data,
          network,
        })
      }

      for (let i = 0; i < keysOnNetworkHooks.length; i++) {
        const keysOnNetworkHook = keysOnNetworkHooks[i]
        await notifyHook(keysOnNetworkHook, {
          network,
          data: keys,
        })
      }

      const processedHookItems = keys.map((key: any) => {
        return {
          network,
          type: 'key',
          objectId: key.id,
        }
      })

      await ProcessedHookItem.bulkCreate(processedHookItems)
    }

    // A short page means there are no older keys left to read.
    if (fetched < FETCH_LIMIT) {
      break
    }

    // Keys come newest first: once a whole page was already processed,
    // every older key was handled by an earlier run.
    if (!fullScan && !keys.length) {
      break
    }

    page += 1
  }
}

export async function notifyOfKeys(
  hooks: Hook[],
  { fullScan = false }: { fullScan?: boolean } = {}
) {
  for (const network of Object.values(networks)) {
    if (network.id !== 31337) {
      const hooksFilteredByNetwork = hooks.filter(
        (hook) => hook.network === network.id
      )
      try {
        await notifyHooksOfAllUnprocessedKeys(
          hooksFilteredByNetwork,
          network.id,
          fullScan
        )
      } catch (error) {
        logger.error('Error notifying of keys', { network: network.id, error })
      }
    }
  }
}
