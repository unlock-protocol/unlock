// eslint-disable-next-line import/no-unresolved
import { Response } from 'express-serve-static-core'
import { networks } from '@unlock-protocol/networks'
import { SignedRequest } from '../types'
import { Hook } from '../models'

export function createHookHandler(topic: string) {
  return async (req: SignedRequest, res: Response): Promise<any> => {
    const { network, lock } = req.params
    if (!networks[network]) {
      return res.status(404).send({
        error: `Network ${network} not supported!`,
      })
    }

    const { callback, lease_seconds, secret, mode } = req.body

    const [hook, created] = await Hook.findOrCreate<Hook>({
      where: {
        topic,
        callback: req.body.callback,
      },
      defaults: {
        callback,
        mode: 'subscribe',
        topic,
        network,
        secret,
        expiration: lease_seconds,
        lock,
      },
    })

    if (mode && hook.mode !== mode) {
      hook.mode = mode
      await hook.save()
    }
    return res.status(created ? 201 : 200).send(hook.toJSON())
  }
}
