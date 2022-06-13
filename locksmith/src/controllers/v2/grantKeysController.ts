import { Request, Response } from 'express'
import Normalizer from '../../utils/normalizer'
import logger from '../../logger'
import Dispatcher from '../../fulfillment/dispatcher'
import * as z from 'zod'
import GasPrice from '../../utils/gasPrice'
import { GAS_COST_TO_GRANT } from '../../utils/keyPricer'

const Key = z.object({
  recipient: z.string(),
  expiration: z.number(),
  manager: z.string(),
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
      const dispatcher = new Dispatcher()

      const gasPrice = new GasPrice()
      const gasCost = await gasPrice.gasPriceUSD(network, GAS_COST_TO_GRANT) // in cents!

      // We max at 5 cts per transaction
      if (gasCost > 5) {
        response.status(500).send({
          error: 'Gas fees too high to grant keys',
        })
        return
      }

      const hasEnoughToPayForGas = await dispatcher.hasFundsForTransaction(
        network
      )

      if (!hasEnoughToPayForGas) {
        response.status(500).send({
          error: `Purchaser does not have enough to pay for gas on ${network}`,
        })
        return
      }

      dispatcher.grantKeys(
        lockAddress,
        keys,
        network,
        async (error: any, hash: string) => {
          if (error) {
            logger.error(error)
            response.status(500).send({
              error: 'There was an error granting the keys',
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
      console.error(error)
      response.status(500).send({
        error: 'There was an error granting keys. Please try again.',
      })
      return
    }
  }
}
