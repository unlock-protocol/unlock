import { Response, Request } from 'express'
import { networks } from '@unlock-protocol/networks'
import * as z from 'zod'
import fetch from 'node-fetch'
import crypto from 'crypto'
import logger from '../logger'
import { Hook } from '../models'
export type SubscribeParams = Partial<Record<'lock' | 'network', string>>
export type SubscribeRequest = Request<SubscribeParams, Record<string, string>>

const Hub = z.object({
  topic: z.string().url(),
  callback: z.string().url(),
  mode: z.enum(['subscribe', 'unsubscribe']),
  lease_seconds: z.number().positive().optional(),
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
    // Subscription request should be of content type: application/x-www-form-urlencoded as per spec - https://www.w3.org/TR/websub/#subscriber-sends-subscription-request
    if (
      request.headers['content-type'] !== 'application/x-www-form-urlencoded'
    ) {
      return response
        .status(415)
        .send('Only application/x-www-form-urlencoded request is accepted.')
    }
    const network = this.getNetwork(request.params.network!)
    const hub = {
      topic: request.body['hub.topic'],
      mode: request.body['hub.mode'],
      callback: request.body['hub.callback'],
      secret: request.body['hub.secret'],
      lease_seconds: request.body['hub.lease_seconds']
        ? Number(request.body['hub.lease_seconds'])
        : undefined,
    }

    if (!network) {
      return response.status(404).send('Unsupported Network')
    }
    const result = await Hub.safeParseAsync(hub)
    if (!result.success) {
      return response.status(400).send(result.error.flatten())
    } else {
      // Send the accepted request to the subscriber and then validate the intent of the subscriber as well as persist the subscription.
      response.status(202).send('Accepted')
      try {
        await this.verifySubscriber(hub)
        logger.info(`${hub.mode} intent confirmed for ${hub.topic}`)
        await this.updateHook(hub, request.params)
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
    const limit = this.getLeaseSeconds(leaseSeconds)
    return new Date(Date.now() + limit * 1000)
  }

  // Get the correct lease seconds
  getLeaseSeconds(leaseSeconds?: number) {
    const limit = leaseSeconds ?? this.options.leaseSeconds.default
    if (limit > this.options.leaseSeconds.limit) {
      return this.options.leaseSeconds.limit
    }
    return limit
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
  async verifySubscriber(hub: z.infer<typeof Hub>) {
    const challenge = this.getChallege()

    const callbackEndpoint = new URL(hub.callback)
    callbackEndpoint.searchParams.set('hub.challenge', challenge)
    callbackEndpoint.searchParams.set('hub.topic', hub.topic)
    callbackEndpoint.searchParams.set(
      'hub.lease_seconds',
      String(this.getLeaseSeconds(hub.lease_seconds!))
    )
    callbackEndpoint.searchParams.set('hub.mode', hub.mode)
    callbackEndpoint.searchParams.set('hub.secret', hub.secret!)

    const result = await fetch(callbackEndpoint.toString())
    if (!result.ok) {
      throw new Error('Failed to confirm subscription intent')
    }

    const text = await result.text()

    if (text != challenge) {
      const rejectedError = new Error('Challenge body does not match')
      const rejectionEndpoint = new URL(hub.callback)
      rejectionEndpoint.searchParams.set('hub.mode', hub.mode)
      rejectionEndpoint.searchParams.set('hub.topic', hub.topic)
      rejectionEndpoint.searchParams.set('hub.reason', rejectedError.message)
      // Notify the callback url of the rejection reason
      const res = await fetch(rejectionEndpoint.toString())
      if (!res.ok) {
        throw new Error('Failed to notify the subscriber about rejection')
      }
      throw rejectedError
    }
  }

  // Provide ability to update lease_seconds, secret, and mode.
  async updateHook(hub: z.infer<typeof Hub>, params: SubscribeParams) {
    const { network } = params
    const hook = await Hook.findOne({
      where: {
        callback: hub.callback,
        topic: hub.topic,
        network: Number(network),
      },
    })

    // If we can't find a hook to update, we create a new one.
    if (!hook) {
      const newHook = await this.createHook(hub, params)
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
  async createHook(hub: z.infer<typeof Hub>, params: SubscribeParams) {
    const { network, lock } = params
    const hook = new Hook()
    hook.network = Number(network)
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
