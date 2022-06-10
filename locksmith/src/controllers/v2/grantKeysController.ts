import { Request, Response } from 'express'
import Normalizer from '../../utils/normalizer'
import logger from '../../logger'
import Dispatcher from '../../fulfillment/dispatcher'
import * as z from 'zod'

const Key = z.object({
  recipient: z.string(),
})

const GrantKeysBody = z.object({
  keys: z.array(Key),
})
export class GrantKeysController {
  constructor() {}

  /**
   * API to grant keys, can only be called by a lock manager with an "app token".
   * URL includes:
   * - network
   * - lock
   * Body must include list of keys to be granted in the form
   * [
   *    {
   *      recipient
   *      expiration
   *      manager
   *    }
   * ]
   * @param request
   * @param response
   * @returns
   */
  async grantKeys(request: Request, response: Response) {
    try {
      const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)
      const network = Number(request.params.network)
      const { keys } = await GrantKeysBody.parseAsync(request.body)

      /** Duration and managers are ignored for now, until a later PR since dispatcher does not support them yet */
      const recipients = keys.map((k: any) => k.recipient)
      const dispatcher = new Dispatcher()

      dispatcher.grantKeys(
        lockAddress,
        recipients,
        network,
        async (error: any, hash: string) => {
          if (error) {
            response.status(500).send({
              error,
            })
            return
          }
          response.status(200).send({
            hash,
          })
          return
        }
      )
      return
    } catch (error) {
      logger.error(error.message)
      response.status(500).send({
        message: 'Grant key failed',
      })
      return
    }
  }
}
