import { networks } from '@unlock-protocol/networks'
import pRetry from 'p-retry'
import { Hook, HookEvent } from '../models'

const notify = (hook: Hook, body: unknown) => async () => {
  const response = await fetch(hook.callback, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(`${response.status} - ${response.statusText}`)
  }
  return response.json()
}

export async function notifyHook(hook: Hook, body: unknown) {
  const hookEvent = new HookEvent()
  hookEvent.network = hook.network
  hookEvent.hookId = hook.id
  hookEvent.lock = hook.lock
  hookEvent.state = 'pending'
  hookEvent.attempts = 0
  hookEvent.body = JSON.stringify(body)

  await hookEvent.save()

  const result = await pRetry(notify(hook, body), {
    onFailedAttempt(error: Error) {
      hookEvent.attempts += 1
      hookEvent.state = 'failed'
      hookEvent.lastError = error.message
      hookEvent.save()
    },
    retries: 3,
  })

  if (result) {
    hookEvent.state = 'success'
    hookEvent.save()
  }
}

export async function networkMapToFnResult<T = unknown>(
  run: (network: number) => Promise<T>
) {
  const items = await Promise.allSettled(
    Object.values(networks)
      // We don't run this on the localhost network
      .filter((network) => network.id !== 31337)
      .map(async (network) => {
        const networkId = network.id
        return {
          network: networkId,
          data: await run(networkId),
        }
      })
  )
  const map = new Map<number, T>()
  for (const item of items) {
    if (item.status === 'fulfilled') {
      const { network, data } = item.value
      map.set(network, data)
    }
  }
  return map
}
