import { networks } from '@unlock-protocol/networks'
import pRetry from 'p-retry'
import crypto from 'crypto'
import fetch from 'cross-fetch'
import { Hook, HookEvent } from '../models'

export const notify = (hook: Hook, body: unknown) => async () => {
  const headers: Record<string, string> = {}
  const bodyString = JSON.stringify(body)
  headers['Content-Type'] = 'application/json'
  if (hook.secret) {
    const signature = crypto
      .createHmac('sha256', hook.secret)
      .update(bodyString)
      .digest('hex')
    headers['X-Hub-Signature'] = `sha256=${signature}`
  }
  const response = await fetch(hook.callback, {
    headers: headers,
    method: 'POST',
    body: bodyString,
  })

  return response
}

export async function notifyHook(hook: Hook, body: unknown) {
  const hookEvent = new HookEvent()
  hookEvent.network = hook.network
  hookEvent.hookId = hook.id
  hookEvent.lock = hook.lock
  hookEvent.state = 'pending'
  hookEvent.attempts = 0
  hookEvent.topic = hook.topic
  hookEvent.body = JSON.stringify(body)
  // Save the pending state in database
  await hookEvent.save()

  const result = await pRetry(
    async () => {
      const fn = notify(hook, body)
      const response = await fn()
      const content = await response.text()
      if (!response.ok) {
        throw new Error(`${response.status}: ${content}`)
      }
      return content
    },
    {
      onFailedAttempt(error: Error) {
        hookEvent.attempts += 1
        hookEvent.state = 'failed'
        hookEvent.lastError = error.message
        hookEvent.save()
      },
      retries: 3,
    }
  )

  if (result) {
    hookEvent.state = 'success'
    hookEvent.save()
  }

  return hookEvent
}

export async function networkMapToFnResult<T = unknown>(
  run: (network: number) => Promise<T> | T
) {
  const items = await Promise.allSettled(
    Object.values(networks).map(async (network) => {
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
