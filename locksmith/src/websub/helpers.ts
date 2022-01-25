import pRetry from 'p-retry'
import crypto from 'crypto'
import fetch from 'cross-fetch'
import { Hook, HookEvent } from '../models'

export const notify = (hook: Hook, body: unknown) => async () => {
  const headers: Record<string, string> = {}
  const content = JSON.stringify(body)
  headers['Content-Type'] = 'application/json'
  if (hook.secret) {
    const algorithm = 'sha256'
    const signature = createSignature({
      content,
      algorithm,
      secret: hook.secret,
    })
    headers['X-Hub-Signature'] = `${algorithm}=${signature}`
  }
  const response = await fetch(hook.callback, {
    headers: headers,
    method: 'POST',
    body: content,
  })

  return response
}

interface CreateSignatureOptions {
  content: string
  secret: string
  algorithm: string
}
export function createSignature({
  secret,
  content,
  algorithm,
}: CreateSignatureOptions) {
  const signature = crypto
    .createHmac(algorithm, secret)
    .update(content)
    .digest('hex')
  return signature
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

export function filterHooksByTopic(hooks: Hook[], topic: RegExp) {
  return hooks.filter((hook) => {
    const path = new URL(hook.topic).pathname
    return topic.test(path)
  })
}
