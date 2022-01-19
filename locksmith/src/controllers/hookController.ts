import { Response, Request } from 'express'
import { networks } from '@unlock-protocol/networks'
import * as z from 'zod'
import fetch from 'cross-fetch'
import crypto from 'crypto'
import html from 'html-template-tag'
import logger from '../logger'
import { Hook } from '../models'

const Hub = z.object({
  topic: z.string().url(),
  callback: z.string().url(),
  mode: z.enum(['subscribe', 'unsubscribe']),
  lease_seconds: z.number().optional(),
  secret: z.string().optional(),
})

const EXPIRATION_SECONDS_LIMIT = 86400 * 90

export function getExpiration(leaseSeconds?: number) {
  const limit = leaseSeconds ?? 864000
  if (limit > EXPIRATION_SECONDS_LIMIT) {
    throw new Error("Lease seconds can't be greater than 90 days")
  }
  return new Date(Date.now() + limit * 1000)
}

export async function subscribe(
  hub: z.infer<typeof Hub>,
  params: Record<string, string>
) {
  try {
    const hook = await Hook.findOne({
      where: {
        topic: hub.topic,
        callback: hub.callback,
      },
    })

    if (!hook) {
      await validHubIntent(hub)

      const expiration = getExpiration(hub.lease_seconds)

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

    if (hook.mode !== hub.mode) {
      hook.mode = hub.mode
    }

    if (hub.lease_seconds) {
      hook.expiration = getExpiration(hub.lease_seconds)
    }

    if (hub.secret) {
      hook.secret = hub.secret
    }

    await validHubIntent(hub)

    await hook.save()
    return hook
  } catch (error) {
    logger.error(error.message)
    return error
  }
}

// Check if the subscriber request is valid or not. This will post a challenge to subscriber to confirm the intent of the request.
export async function validHubIntent(hub: z.infer<typeof Hub>) {
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
}

export function getSupportedNetwork(network: string) {
  if (!networks[network]) {
    logger.error(`Unsupported network: ${network}`)
    return
  }
  return networks[network]
}

export async function subscriptionHandler(req: Request, res: Response) {
  try {
    // We check the hub schema here to make sure the subscriber is sending us the correct data.
    const hub = await Hub.parseAsync(req.body.hub)
    // We check the network here to make sure the subscriber is sending to the right network endpoint.
    const network = getSupportedNetwork(req.params.network)
    if (!network) {
      return res.status(400).send('Unsupported network')
    }
    // We send the accepted request to the subscriber and then validate the intent of the subscriber as well as persist the subscription.
    res.status(202).send('Accepted')
    return subscribe(hub, req.params)
  } catch (error) {
    logger.error(error.message)
    // We respond with the error if we cannot subscribe or there is an error in the subscriber request.
    return res.status(500).send({
      hub: {
        mode: req.body.hub.mode,
        topic: req.body.hub.topic,
        reason: error.message,
      },
    })
  }
}

export function publisherHandler(req: Request, res: Response) {
  try {
    const network = getSupportedNetwork(req.params.network)
    if (!network) {
      return res.status(400).send('Unsupported network')
    }

    const url = new URL(req.originalUrl, `${req.protocol}://${req.hostname}`)
    const links = [
      {
        rel: 'self',
        href: url.toString(),
      },
      {
        rel: 'hub',
        href: url.toString(),
      },
    ]
    res.setHeader(
      'Link',
      links.map((item) => `<${item.href}>; rel="${item.rel}"`)
    )

    const htmlResponse = `
      <!DOCTYPE html>
      <html>
        <head>
          ${links
            .map((item) => html`<link rel="${item.rel}" href="${item.href}" />`)
            .join('')}
        </head>
        <body>
           To subscribe to our topic, make a POST request to this endpoint with the valid hub payload.
           The link to hub is also included in the head and headers.
        </body>
      </html>
    `
    return res.status(200).send(htmlResponse)
  } catch (error) {
    logger.error(error.message)
    return res.status(500).send(error.message)
  }
}
