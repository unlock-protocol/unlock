import { Key } from '../../graphql/datasource'
import { Hook, ProcessedHookItem } from '../../models'
import { TOPIC_KEYS } from '../topics'

import { networkMapToFnResult, notifyHook } from '../helpers'

async function getUnprocessedKeys(network: number) {
  const keySource = new Key(network)
  const processedKeys = await ProcessedHookItem.findAll({
    where: {
      type: 'key',
      network,
    },
    order: [['id', 'DESC']],
  })
  const keys = await keySource.getKeys({ first: 25 })
  const results = keys.filter(
    (key: any) => !processedKeys.find((item) => item.objectId === key.id)
  )

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
      .get(Number(hook.network))
      .filter((key: any) => key.lock.id === hook.lock)
    notifyHook(hook, data)
  }
}
