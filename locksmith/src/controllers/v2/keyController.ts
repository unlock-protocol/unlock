import { Request, Response } from 'express'
import Normalizer from '../../utils/normalizer'
import logger from '../../logger'
import * as keysOperations from '../../operations/keysOperations'
import { PAGE_SIZE } from '@unlock-protocol/core'

export default class KeyController {
  /**
   * List of keys with additional metadata when caller is the lockManager
   * Deprecated, prefer `keysByPage`
   * @return {Array} keys list
   */
  async keys(request: Request, response: Response) {
    try {
      const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)
      const network = Number(request.params.network)
      const {
        query = '',
        page = 0,
        max = PAGE_SIZE,
        filterKey,
        expiration = 'active',
        approval = 'minted',
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
        approval,
        max: Math.min(PAGE_SIZE, Number(max)),
      }

      const loggedInUserAddress = Normalizer.ethereumAddress(
        request!.user!.walletAddress
      )

      const { keys } = await keysOperations.getKeysWithMetadata({
        network,
        lockAddress,
        filters,
        loggedInUserAddress,
      })

      return response.status(200).send(keys)
    } catch (error) {
      logger.error(error.message)
      return response.status(500).send({
        message: 'Keys list could not be retrieved.',
      })
    }
  }

  /**
   * List of keys with additional metadata when caller is the lockManager
   */
  async keysByPage(request: Request, response: Response) {
    try {
      const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)
      const network = Number(request.params.network)
      const {
        query = '',
        page = 0,
        max = PAGE_SIZE,
        filterKey,
        expiration = 'active',
        approval = 'minted',
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
        approval,
        max: Math.min(PAGE_SIZE, Number(max)),
      }

      const loggedInUserAddress = Normalizer.ethereumAddress(
        request!.user!.walletAddress
      )

      const { keys, total } = await keysOperations.getKeysWithMetadata({
        network,
        lockAddress,
        filters,
        loggedInUserAddress,
      })

      return response.status(200).send({
        keys,
        meta: {
          total,
          page: Number(page),
          byPage: filters.max,
        },
      })
    } catch (error) {
      return response.status(500).send({
        message: 'Keys list could not be retrieved.',
      })
    }
  }
}
