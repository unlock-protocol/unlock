import { Lock } from '../../graphql/datasource'
import { Hook } from '../../models'
import { TOPIC_LOCKS } from '../topics'

import { networkMapToFnResult, notifyHook } from '../helpers'

export async function notifyOfLocks(hooks: Hook[]) {
  const subscribed = hooks.filter((hook) => {
    const path = new URL(hook.topic).pathname
    return TOPIC_LOCKS.test(path)
  })

  const lockSource = new Lock()
  const networkToLocksMap = await networkMapToFnResult((network) =>
    lockSource.getLocks({ first: 25 }, Number(network))
  )
  for (const hook of subscribed) {
    const data = networkToLocksMap.get(hook.network)
    notifyHook(hook, data)
  }
}
