import { Op } from 'sequelize'
import { Key } from '../../graphql/datasource'
import { Hook, ProcessedHookItem } from '../../models'
import { TOPIC_KEYS } from '../topics'

import {
  networkMapToFnResult,
  notifyHook,
  filterHooksByTopic,
} from '../helpers'

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

async function fetchAllUnprocessedKeys(network: number) {
  let page = 0
  const items = []

  while (true) {
    const keys = await fetchUnprocessedKeys(network, page)
    // If empty, break the loop and return as there are no more new keys to process.
    if (!keys.length) {
      break
    }
    items.push(keys)
    page += 1
  }
  return items.flat()
}

export async function notifyOfKeys(hooks: Hook[]) {
  const subscribedHooks = filterHooksByTopic(hooks, TOPIC_KEYS)
  const networkToKeys = await networkMapToFnResult(fetchAllUnprocessedKeys)

  for (const subscribedHook of subscribedHooks) {
    const networkId = Number(subscribedHook.network)

    const data = networkToKeys
      .get(networkId)!
      .filter((key: any) => key.lock.id === subscribedHook.lock)

    await notifyHook(subscribedHook, { data, network: networkId })
  }

  for (const [network, processedKeys] of networkToKeys.entries()) {
    const processedHookItems = processedKeys.map((key: any) => {
      return {
        network,
        type: 'key',
        objectId: key.id,
      }
    })
    await ProcessedHookItem.bulkCreate(processedHookItems)
  }
}
