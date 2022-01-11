// eslint-disable-next-line import/no-unresolved
import { Response } from 'express-serve-static-core'
import { networks } from '@unlock-protocol/networks'
import * as z from 'zod'
import fetch from 'cross-fetch'
import crypto from 'crypto'
import logger from '../logger'
import { SignedRequest } from '../types'
import { Hook } from '../models'

const Hub = z.object({
  topic: z.string().url(),
  callback: z.string().url(),
  mode: z.enum(['subscribe', 'unsubscribe']),
  lease_seconds: z.number().optional(),
  secret: z.string().optional(),
})

export async function subscribe(
  hub: z.infer<typeof Hub>,
  params: Record<string, string>
) {
  const hook = await Hook.findOne({
    where: {
      topic: hub.topic,
      callback: hub.callback,
    },
  })

  if (!hook) {
    const check = isValidHubIntent(hub)
    if (!check) {
      const intentError = new Error(
        `Subscriber failed to confirm intent for callback: ${hub.callback} on topic: ${hub.topic}.`
      )
      logger.error(intentError)
      throw intentError
    }

    const expiration = new Date()
    expiration.setSeconds(
      expiration.getSeconds() + (hub.lease_seconds ?? 60 * 60 * 24 * 30)
    )

    const createdHook = await Hook.create({
      expiration,
      topic: hub.topic,
      callback: hub.callback,
      mode: hub.mode,
      secret: hub.secret,
      network: params.network,
      lock: params.lock,
    })

    return createdHook
  }

  // If changing mode, reconfirm the intent and update
  if (hook?.mode !== hub.mode) {
    hook.mode = hub.mode
    const check = isValidHubIntent(hub)
    if (!check) {
      logger.error(
        `Subscriber failed to confirm intent for callback: ${hub.callback} on topic: ${hub.topic}.`
      )
      return
    }
    const updatedHook = await hook.save()
    return updatedHook
  }

  return hook
}

// Check if the subscriber request is valid or not. This will post a challenge to subscriber to confirm the intent of the request.
export async function isValidHubIntent(hub: z.infer<typeof Hub>) {
  try {
    const challenge = crypto.randomBytes(20).toString('hex')
    const result = await fetch(hub.callback, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        hub: {
          ...hub,
          challenge,
        },
      }),
    })

    const json = await result.json()

    if (!result.ok) {
      throw new Error("Subscriber didn't confirm intent.")
    }

    if (json.challenge !== challenge) {
      throw new Error('Challenge did not match')
    }

    if (json.topic !== hub.topic) {
      throw new Error('Topic did not match')
    }

    if (json.callback !== hub.callback) {
      throw new Error('Callback did not match')
    }

    return hub
  } catch (error) {
    logger.error(error.message)
    return false
  }
}

export function getSupportedNetwork(network: string) {
  if (!networks[network]) {
    logger.error(`Unsupported network: ${network}`)
    return
  }
  return networks[network]
}

export async function subscriptionHandler(req: SignedRequest, res: Response) {
  try {
    const hub = await Hub.parseAsync(req.body.hub)
    const hook = await subscribe(hub, req.params)
    return res.status(200).json(hook?.toJSON())
  } catch (error) {
    return res.status(500).send(error.message)
  }
}
