import pRetry from 'p-retry'
import crypto from 'crypto'
import { AbortController } from 'node-abort-controller'
import { setTimeout, clearTimeout } from 'timers'
import { Op } from 'sequelize'
import { Hook, HookEvent } from '../../models'
import { logger } from '../../logger'

interface NotifyOptions {
  timeout?: number
  hook: Hook
  body: unknown
}

export async function notify({ timeout = 1000, hook, body }: NotifyOptions) {
  const headers: Record<string, string> = {}
  const content = JSON.stringify(body)
  const ac = new AbortController()

  const abortTimeout = setTimeout(() => {
    ac.abort()
  }, timeout)

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
    signal: ac.signal,
  })

  clearTimeout(abortTimeout)

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

  try {
    // Save the pending state in database
    await hookEvent.save()

    // Get last 3 HookEvents created after last hook update.
    const previousHookEventsForCurrentHook = await HookEvent.findAll({
      where: {
        hookId: hook.id,
        updatedAt: {
          [Op.gte]: hook.updatedAt,
        },
      },
      order: [['createdAt', 'DESC']],
      limit: 3,
    })

    const checkBadHealth = previousHookEventsForCurrentHook.every(
      (event) => event.state !== 'success'
    )

    await pRetry(
      async () => {
        const response = await notify({
          hook,
          body,
        })

        if (!response.ok) {
          logger.error(`${hook.id}: ${response.statusText}`)
          throw new Error(response.statusText)
        }
        return response
      },
      {
        async onFailedAttempt(error: Error) {
          hookEvent.attempts += 1
          hookEvent.state = 'failed'
          hookEvent.lastError = error.message
          logger.error(`${hook.id}: ${error.message}`)
          await hookEvent.save()
          if (checkBadHealth) {
            throw new pRetry.AbortError(
              `Not retrying because hook: ${hook.id} has not been very responsive.`
            )
          }
        },
        retries: 3,
        minTimeout: 100,
        maxRetryTime: 1000,
        maxTimeout: 200,
      }
    )

    hookEvent.state = 'success'
    await hookEvent.save()
    return hookEvent
  } catch (error) {
    logger.error(error.message)
    return hookEvent
  }
}

export function filterHooksByTopic(hooks: Hook[], topic: RegExp) {
  return hooks.filter((hook) => {
    const path = new URL(hook.topic).pathname
    return topic.test(path)
  })
}
