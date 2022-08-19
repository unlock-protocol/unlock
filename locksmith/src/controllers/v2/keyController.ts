import { Request, Response } from 'express'
import Normalizer from '../../utils/normalizer'
import logger from '../../logger'
import * as keysOperations from '../../operations/keysOperations'
export default class KeyController {
  /**
   * List of keys with additional metadata when caller is the lockManager
   * @return {Array} keys list
   */
  async keys(request: Request, response: Response) {
    try {
      const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)
      const network = Number(request.params.network)
      const {
        query = '',
        page = 0,
        filterKey,
        expiration = 'active',
      } = request.query ?? {}

      if (!filterKey) {
        return response.status(404).send({
          message: 'No filterKey query found.',
        })
      }

      const filters = {
        query,
        page: Number(page),
        filterKey,
        expiration,
      }

      const loggedInUserAddress = Normalizer.ethereumAddress(
        request!.user!.walletAddress
      )

      const keys = await keysOperations.getKeysWithMetadata({
        network,
        lockAddress,
        filters,
        loggedInUserAddress,
      })

      return response.status(200).send(keys)
    } catch (error) {
      console.log('ERROR', error)
      logger.error(error.message)
      return response.status(500).send({
        message: 'Keys list could not be retrived.',
      })
    }
  }
}
