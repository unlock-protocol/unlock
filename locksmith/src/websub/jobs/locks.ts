import { Op } from 'sequelize'
import { Lock } from '../../graphql/datasource'
import { Hook, ProcessedHookItem } from '../../models'
import { TOPIC_LOCKS } from '../topics'

import { networkMapToFnResult, notifyHook } from '../helpers'

const FIRST_LIMIT = 50

export async function fetchUnprocessedLocks(network: number) {
  const lockSource = new Lock(network)
  let page = 0
  const items = []

  while (true) {
    const locks = await lockSource.getLocks({
      first: FIRST_LIMIT,
      skip: page ? page * FIRST_LIMIT : 0,
    })

    const lockIds = locks.map((lock: any) => lock.id)

    const processedLocks = await ProcessedHookItem.findAll({
      where: {
        objectId: {
          [Op.in]: lockIds,
        },
      },
      order: [['id', 'DESC']],
    })

    const onlyUnprocessed = locks.filter(
      (lock: any) => !processedLocks.find((item) => item.objectId === lock.id)
    )

    items.push(onlyUnprocessed)

    if (!onlyUnprocessed.length || onlyUnprocessed.length < locks.length) {
      break
    }

    page += 1
  }
  return items.flat()
}

export async function processNewLocks(network: number) {
  const results = await fetchUnprocessedLocks(network)

  await ProcessedHookItem.bulkCreate(
    results.map((lock: any) => {
      return {
        type: 'lock',
        network,
        objectId: lock.id,
      }
    })
  )
  return results
}

export async function notifyOfLocks(hooks: Hook[]) {
  const subscribed = hooks.filter((hook) => {
    const path = new URL(hook.topic).pathname
    return TOPIC_LOCKS.test(path)
  })

  const networkToLocksMap = await networkMapToFnResult(processNewLocks)
  for (const hook of subscribed) {
    const data = networkToLocksMap.get(Number(hook.network))
    notifyHook(hook, data)
  }
}
