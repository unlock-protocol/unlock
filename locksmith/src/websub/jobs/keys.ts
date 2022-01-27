import { Op } from 'sequelize'
import { networks } from '@unlock-protocol/networks'
import { Key } from '../../graphql/datasource'
import { Hook, ProcessedHookItem } from '../../models'
import { TOPIC_KEYS } from '../topics'
import { notifyHook, filterHooksByTopic } from '../helpers'
import { notifyNewKeysToWedlocks } from '../../operations/wedlocksOperations'

const FETCH_LIMIT = 25

async function fetchUnprocessedKeys(network: number, page = 0) {
  const keySource = new Key(network)
  const keys = await keySource.getKeys({
    first: FETCH_LIMIT,
    skip: page ? page * FETCH_LIMIT : 0,
  })

  const keyIds = keys.map((key: any) => key.id)
  const processedKeys = await ProcessedHookItem.findAll({
    where: {
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
  while (true) {
    const keys = await fetchUnprocessedKeys(network, page)

    // If empty, break the loop and return as there are no more new keys to process.
    if (!keys.length) {
      break
    }

    // Notify all new keys to wedlocks!
    await notifyNewKeysToWedlocks(keys)

    await Promise.all(
      hooks.map(async (hook) => {
        const data = keys.filter((key: any) => key.lock.id === hook.lock)
        const hookEvent = await notifyHook(hook, {
          data,
          network,
        })
        return hookEvent
      })
    )

    const processedHookItems = keys.map((key: any) => {
      return {
        network,
        type: 'key',
        objectId: key.id,
      }
    })

    await ProcessedHookItem.bulkCreate(processedHookItems)

    page += 1
  }
}

export async function notifyOfKeys(hooks: Hook[]) {
  const subscribedHooks = filterHooksByTopic(hooks, TOPIC_KEYS)
  const tasks: Promise<void>[] = []

  for (const network of Object.values(networks)) {
    if (network.id !== 31337) {
      const hooksFilteredByNetwork = subscribedHooks.filter(
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
