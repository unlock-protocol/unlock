import { networks } from '@unlock-protocol/networks'
import pRetry from 'p-retry'
import { Hook, HookEvent } from '../models'

export async function notifyHook(hook: Hook, body: unknown) {
  const hookEvent = new HookEvent()
  hookEvent.network = hook.network
  hookEvent.hookId = hook.id
  hookEvent.lock = hook.lock
  hookEvent.state = 'pending'
  hookEvent.attempts = 0
  const notify = async () => {
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

  const result = await pRetry(notify, {
    onFailedAttempt(error: Error) {
      hookEvent.attempts += 1
      hookEvent.state = 'failed'
      hookEvent.lastError = error.message
      hookEvent.save()
    },
    retries: 3,
  })

  if (result) {
    hookEvent.body = JSON.stringify(body)
    hookEvent.state = 'success'
    hookEvent.save()
  }
}

export async function networkMapToFnResult<T = unknown>(
  run: (network: string) => Promise<T>
) {
  const items = await Promise.allSettled(
    Object.keys(networks).map(async (network) => {
      return {
        network,
        data: await run(network),
      }
    })
  )
  const map = new Map<string, T>()

  for (const item of items) {
    if (item.status === 'fulfilled') {
      const { network, data } = item.value
      map.set(network, data)
    }
  }
  return map
}
