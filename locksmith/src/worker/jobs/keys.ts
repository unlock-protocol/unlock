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

async function fetchUnprocessedKeys(network: number, page = 0) {
  const subgraph = new SubgraphService()
  const skip = page ? page * FETCH_LIMIT : 0

  const keys = await subgraph.keys(
    {
      first: FETCH_LIMIT,
      skip,
      orderBy: KeyOrderBy.CreatedAtBlock,
      orderDirection: OrderDirection.Desc,
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
  return unprocessedKeys
}

async function notifyHooksOfAllUnprocessedKeys(hooks: Hook[], network: number) {
  let page = 0
  const keysOnLockHooks = filterHooksByTopic(hooks, TOPIC_KEYS_ON_LOCK)
  const keysOnNetworkHooks = filterHooksByTopic(hooks, TOPIC_KEYS_ON_NETWORK)
  while (true) {
    const keys = await fetchUnprocessedKeys(network, page)

    // If empty, break the loop and return as there are no more new keys to process.
    if (!keys.length && page > 10) {
      break
    }

    if (keys.length > 0) {
      logger.info('Found new keys', {
        keys: keys.map((key: any) => [network, key.lock.address, key.id]),
      })

      await Promise.allSettled([
        notifyNewKeysToWedlocks(keys, network), // send emails when applicable!
        // Send notification to hooks subscribed to keys on a specific lock address
        ...keysOnLockHooks.map(async (keysOnLockHook) => {
          const data = keys.filter(
            (key: any) => key.lock.id === keysOnLockHook.lock
          )
          const hookEvent = await notifyHook(keysOnLockHook, {
            data,
            network,
          })
          return hookEvent
        }),
        // Send notification to hooks subscribed to keys on a whole network
        ...keysOnNetworkHooks.map(async (keysOnNetworkHook) => {
          const hookEvent = await notifyHook(keysOnNetworkHook, {
            network,
            data: keys,
          })
          return hookEvent
        }),
      ])

      const processedHookItems = keys.map((key: any) => {
        return {
          network,
          type: 'key',
          objectId: key.id,
        }
      })

      await ProcessedHookItem.bulkCreate(processedHookItems)
    }

    page += 1
  }
}

export async function notifyOfKeys(hooks: Hook[]) {
  const tasks: Promise<void>[] = []

  for (const network of Object.values(networks)) {
    if (network.id !== 31337) {
      const hooksFilteredByNetwork = hooks.filter(
        (hook) => hook.network === network.id
      )
      const task = notifyHooksOfAllUnprocessedKeys(
        hooksFilteredByNetwork,
        network.id
      )
      tasks.push(task)
    }
  }

  await Promise.allSettled(tasks)
}
