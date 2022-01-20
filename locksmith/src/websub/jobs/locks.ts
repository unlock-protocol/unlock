import { Lock } from '../../graphql/datasource'
import { Hook, ProcessedHookItem } from '../../models'
import { TOPIC_LOCKS } from '../topics'

import { networkMapToFnResult, notifyHook } from '../helpers'

export async function getUnprocessedLocks(network: number) {
  const lockSource = new Lock(network)
  const processedLocks = await ProcessedHookItem.findAll({
    where: {
      type: 'lock',
      network,
    },
    order: [['id', 'DESC']],
  })
  const locks = await lockSource.getLocks({ first: 25 })
  const results = locks.filter(
    (lock: any) => !processedLocks.find((item) => item.objectId === lock.id)
  )

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

  const networkToLocksMap = await networkMapToFnResult(getUnprocessedLocks)
  for (const hook of subscribed) {
    const data = networkToLocksMap.get(Number(hook.network))
    notifyHook(hook, data)
  }
}
