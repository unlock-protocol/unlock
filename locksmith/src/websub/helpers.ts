import { networks } from '@unlock-protocol/networks'
import pRetry from 'p-retry'
import crypto from 'crypto'
import { Hook, HookEvent } from '../models'

const notify = (hook: Hook, body: unknown) => async () => {
  const headers = new Headers()
  const bodyString = JSON.stringify(body)
  headers.append('Content-Type', 'application/json')
  if (hook.secret) {
    const signature = crypto
      .createHmac('sha256', hook.secret)
      .update(bodyString)
      .digest('hex')
    headers.append('X-Hub-Signature', `sha256=${signature}`)
  }
  const response = await fetch(hook.callback, {
    headers: headers,
    method: 'POST',
    body: bodyString,
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
  // Save the pending state in database
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
