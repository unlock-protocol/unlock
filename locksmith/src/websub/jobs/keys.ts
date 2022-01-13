import { Key } from '../../graphql/datasource'
import { Hook } from '../../models'
import { TOPIC_KEYS } from '../topics'

import { networkMapToFnResult, notifyHook } from '../helpers'

export async function notifyOfKeys(hooks: Hook[]) {
  const subscribed = hooks.filter((hook) => {
    const path = new URL(hook.topic).pathname
    return TOPIC_KEYS.test(path)
  })

  const keySource = new Key()
  const networkToLocksMap = await networkMapToFnResult((network) =>
    keySource.getKeys({ first: 25 }, Number(network))
  )
  for (const hook of subscribed) {
    const data = networkToLocksMap
      .get(hook.network)
      .filter((key: any) => key.lock.id === hook.lock)
    notifyHook(hook, data)
  }
}
