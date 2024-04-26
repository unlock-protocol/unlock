import pRetry, { AbortError } from 'p-retry'
import crypto from 'crypto'
import { setTimeout, clearTimeout } from 'timers'
import { Op } from 'sequelize'
import { Hook, HookEvent } from '../../models'
import { logger } from '../../logger'

interface NotifyOptions {
  timeout?: number
  hookSecret?: string // TODO: change to just `secret`
  hookCallback: string // TODO: change to just `callback`
  body: unknown
}

export async function notify({
  timeout = 1000,
  hookSecret, // TODO: change to just `secret`
  hookCallback, // TODO: change to just `callback`
  body,
}: NotifyOptions) {
  const headers: Record<string, string> = {}
  const content = JSON.stringify(body)
  const ac = new AbortController()

  const abortTimeout = setTimeout(() => {
    ac.abort()
  }, timeout)

  headers['Content-Type'] = 'application/json'
  if (hookSecret) {
    const algorithm = 'sha256'
    const signature = createSignature({
      content,
      algorithm,
      secret: hookSecret,
    })
    headers['X-Hub-Signature'] = `${algorithm}=${signature}`
  }
  const response = await fetch(hookCallback, {
    headers: headers,
    method: 'POST',
    body: content,
    signal: ac.signal,
  }).catch((error) => {
    logger.error('Error in notify function: ', error)
    return {
      ok: false,
      statusText: 'client error',
      status: '400',
      text: () => error.message,
      json: () => Promise.resolve({ message: error.message }),
    }
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

export async function notifyHook(
  { network, id, lock, topic, updatedAt, secret, callback }: Hook,
  body: unknown
) {
  const hookEvent = new HookEvent()
  hookEvent.network = network
  hookEvent.hookId = id
  hookEvent.lock = lock
  hookEvent.state = 'pending'
  hookEvent.attempts = 0
  hookEvent.topic = topic
  hookEvent.body = JSON.stringify(body)

  try {
    // Save the pending state in database
    await hookEvent.save()

    // Get last 3 HookEvents created after last hook update.
    const previousHookEventsForCurrentHook = await HookEvent.findAll({
      where: {
        hookId: id,
        updatedAt: {
          [Op.gte]: updatedAt,
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
          hookSecret: secret,
          hookCallback: callback,
          body,
        })

        if (!response.ok) {
          logger.error(`${id}: ${response.statusText}`)
          throw new Error(response.statusText)
        }
        return response
      },
      {
        async onFailedAttempt(error: Error) {
          hookEvent.attempts += 1
          hookEvent.state = 'failed'
          hookEvent.lastError = error.message
          logger.error(`${id}: ${error.message}`)
          await hookEvent.save()
          if (checkBadHealth) {
            throw new AbortError(
              `Not retrying because hook: ${id} has not been very responsive.`
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
