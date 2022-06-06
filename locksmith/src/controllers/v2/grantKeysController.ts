import { Request, Response } from 'express'
import Normalizer from '../../utils/normalizer'
import logger from '../../logger'

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

      console.log(request.user)

      const keys = request.body.keys
      console.log(keys)
      console.log(lockAddress)
      console.log(network)
      return response.status(200).send({
        hash: '0x123',
      })
    } catch (error) {
      logger.error(error.message)
      return response.status(500).send({
        message: 'Grant key failed',
      })
    }
  }
}
