import { Op } from 'sequelize'
import { Key } from '../../graphql/datasource'
import { Hook, ProcessedHookItem } from '../../models'
import { TOPIC_KEYS } from '../topics'

import { networkMapToFnResult, notifyHook } from '../helpers'

const FIRST_LIMIT = 50

export async function fetchUnprocessedKeys(network: number) {
  const keySource = new Key(network)
  let page = 0
  const items = []

  while (true) {
    const keys = await keySource.getKeys({
      first: FIRST_LIMIT,
      skip: page ? page * FIRST_LIMIT : 0,
    })

    const keyIds = keys.map((lock: any) => lock.id)

    const processedLocks = await ProcessedHookItem.findAll({
      where: {
        objectId: {
          [Op.in]: keyIds,
        },
      },
      order: [['id', 'DESC']],
    })

    const onlyUnprocessed = keys.filter(
      (key: any) => !processedLocks.find((item) => item.objectId === key.id)
    )

    items.push(onlyUnprocessed)

    if (!onlyUnprocessed.length || onlyUnprocessed.length < keys.length) {
      break
    }

    page += 1
  }
  return items.flat()
}

async function getUnprocessedKeys(network: number) {
  const results = await fetchUnprocessedKeys(network)

  await ProcessedHookItem.bulkCreate(
    results.map((key: any) => {
      return {
        type: 'key',
        network,
        objectId: key.id,
      }
    })
  )
  return results
}

export async function notifyOfKeys(hooks: Hook[]) {
  const subscribed = hooks.filter((hook) => {
    const path = new URL(hook.topic).pathname
    return TOPIC_KEYS.test(path)
  })

  const networkToLocksMap = await networkMapToFnResult(getUnprocessedKeys)

  for (const hook of subscribed) {
    const data = networkToLocksMap
      .get(Number(hook.network))!
      .filter((key: any) => key.lock.id === hook.lock)
    notifyHook(hook, data)
  }
}
