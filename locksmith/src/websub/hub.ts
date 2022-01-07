import cron from 'node-cron'
import fetch from 'cross-fetch'
import { networks } from '@unlock-protocol/networks'
import { Key } from '../graphql/datasource'
import { Hook } from '../models'
import { logger } from '../logger'

logger.info('Locksmith hub started!')

async function notifyHook(hook: Hook, body: any) {
  const { callback } = hook
  try {
    const response = await fetch(callback, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (response.status !== 200) {
      throw new Error('Hook returned non-200 status code')
    }
    logger.info(`Hook ${hook.id} notified`)
  } catch (error) {
    logger.error(`Hook ${hook.id} failed to notify`)
  }
}

cron.schedule('* * * * *', async () => {
  const hooks = await Hook.findAll({
    where: {
      mode: 'subscribe',
      topic: 'keys',
    },
  })

  const subscribedHooks = hooks.filter((hook) => hook.mode === 'subscribe')

  const keys = await Promise.allSettled(
    Object.values(networks).map(async (network) => {
      const keys = await new Key().getKeys({ first: 10 }, network.id)
      return {
        network: network.id,
        keys,
      }
    })
  )

  const keysNetworkMap = keys.reduce<{ [key: string]: any }>((acc, item) => {
    if (item.status === 'fulfilled') {
      acc[item.value.network] = item.value.keys
    }
    return acc
  }, {})

  for (const hook of subscribedHooks) {
    const filteredKeys = keysNetworkMap[hook.network].filter(
      (key: any) => key.lock.address === hook.lock
    )
    notifyHook(hook, { keys: filteredKeys })
  }
})
