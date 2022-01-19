import { Response, Request } from 'express'
import { networks } from '@unlock-protocol/networks'
import * as z from 'zod'
import fetch from 'cross-fetch'
import crypto from 'crypto'
import { deepStrictEqual } from 'assert'
import logger from '../logger'
import { Hook } from '../models'

export type SubscribeRequest = Request<
  {
    lock?: string
    network: string
  },
  {},
  {
    hub: z.infer<typeof Hub>
  }
>

const Hub = z.object({
  topic: z.string().url(),
  callback: z.string().url(),
  mode: z.enum(['subscribe', 'unsubscribe']),
  lease_seconds: z.number().optional(),
  secret: z.string().optional(),
})

interface HookControllerOptions {
  leaseSeconds: {
    limit: number
    default: number
  }
}
export class HookController {
  // eslint-disable-next-line
  constructor(public options: HookControllerOptions) {}

  async handle(request: SubscribeRequest, response: Response) {
    const network = this.getNetwork(request.params.network)
    if (!network) {
      return response.status(404).send('Unsupported Network')
    }
    const result = await Hub.safeParseAsync(request.body.hub)
    if (!result.success) {
      return response.status(400).send({
        hub: {
          mode: request.body.hub.mode,
          topic: request.body.hub.topic,
          reason: result.error.message,
        },
      })
    } else {
      // Send the accepted request to the subscriber and then validate the intent of the subscriber as well as persist the subscription.
      response.status(202).send('Accepted')
      try {
        await this.verifySubscriber(request)
        await this.updateHook(request)
        return
      } catch (error) {
        logger.error(error.message)
        // eslint-disable-next-line
        return
      }
    }
  }

  // Create an expiration date based on lease_seconds
  getExpiration(leaseSeconds?: number) {
    const limit = leaseSeconds ?? this.options.leaseSeconds.default
    if (limit > this.options.leaseSeconds.limit) {
      throw new Error("Lease seconds can't be greater than 90 days")
    }
    return new Date(Date.now() + limit * 1000)
  }

  // Get the correct network config based on id
  getNetwork(id: string) {
    return networks[id]
  }

  // Generate a random string of a buffer of size provided.
  getChallege(size = 20) {
    return crypto.randomBytes(size).toString('hex')
  }

  // Verify the subscriber intent by having them echo back the challenge, hub topic, and hub callback. If they match, we can subscribe.
  async verifySubscriber(request: SubscribeRequest) {
    const { hub } = request.body
    const challenge = this.getChallege()

    const body = {
      hub: {
        ...hub,
        challenge,
      },
    }
    const result = await fetch(hub.callback, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!result.ok) {
      throw new Error('Failed to verify subscriber')
    }

    const json = await result.json()

    // This will throw if the echo is not correct with an assert error.
    deepStrictEqual(json, body)

    return json
  }

  // Provide ability to update lease_seconds, secret, and mode.
  async updateHook(request: SubscribeRequest) {
    const { network } = request.params
    const { hub } = request.body
    const hook = await Hook.findOne({
      where: {
        callback: hub.callback,
        topic: hub.topic,
        network,
      },
    })

    // If we can't find a hook to update, we create a new one.
    if (!hook) {
      const newHook = await this.createHook(request)
      return newHook
    }

    if (hub.lease_seconds) {
      hook.expiration = this.getExpiration(hub.lease_seconds)
    }

    if (hub.secret) {
      hook.secret = hub.secret
    }
    if (hub.mode) {
      hook.mode = hub.mode
    }

    await hook.save()
    return hook
  }

  // Create a hook object and save it to the database.
  async createHook(request: SubscribeRequest) {
    const { network, lock } = request.params
    const { hub } = request.body
    const hook = new Hook()
    hook.network = network
    hook.topic = hub.topic
    hook.callback = hub.callback
    hook.mode = hub.mode
    hook.expiration = this.getExpiration(hub.lease_seconds)
    hook.secret = hub.secret
    hook.lock = lock
    await hook.save()
    return hook
  }
}
