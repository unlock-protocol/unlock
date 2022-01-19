import { Lock } from '../../graphql/datasource'
import { Hook } from '../../models'
import { TOPIC_LOCKS } from '../topics'

import { networkMapToFnResult, notifyHook } from '../helpers'

export async function notifyOfLocks(hooks: Hook[]) {
  const subscribed = hooks.filter((hook) => {
    const path = new URL(hook.topic).pathname
    return TOPIC_LOCKS.test(path)
  })

  const networkToLocksMap = await networkMapToFnResult((network) => {
    const lockSource = new Lock(network)
    return lockSource.getLocks({ first: 25 })
  })
  for (const hook of subscribed) {
    const data = networkToLocksMap.get(Number(hook.network))
    notifyHook(hook, data)
  }
}
