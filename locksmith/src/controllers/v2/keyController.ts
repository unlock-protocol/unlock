import { Request, Response } from 'express'
import Normalizer from '../../utils/normalizer'
import logger from '../../logger'
import * as keysOperations from '../../operations/keysOperations'
import { PAGE_SIZE } from '@unlock-protocol/core'
import { randomUUID } from 'node:crypto'
import { ExportKeysJobPayload } from '../../worker/tasks/exportKeysJob'
import { downloadJsonFromS3 } from '../../utils/downloadJsonFromS3'
import config from '../../config/config'
import { addJob } from '../../worker/worker'

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
        response.status(404).send({
          message: 'No filterKey query found.',
        })
        return
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

      response.status(200).send(keys)
      return
    } catch (error) {
      logger.error(error.message)
      response.status(500).send({
        message: 'Keys list could not be retrieved.',
      })
      return
    }
  }

  /**
   * Initiates worker task to get all the keys for a given lock
   */
  async exportKeys(request: Request, response: Response) {
    try {
      const jobId = randomUUID()

      const payload = ExportKeysJobPayload.parse({
        jobId: jobId as string,
        lockAddress: Normalizer.ethereumAddress(request.params.lockAddress),
        network: Number(request.params.network),
        query: request.query.query ?? '',
        filterKey: request.query.filterKey,
        expiration: request.query.expiration ?? 'active',
        approval: request.query.approval ?? 'minted',
        loggedInUserAddress: Normalizer.ethereumAddress(
          request.user!.walletAddress
        ),
      })

      // Default priority for tasks is 0, we do not want to make clients wait
      await addJob('exportKeysJob', payload, {
        priority: -1,
      })

      response.status(200).send({ jobId })
      return
    } catch (error) {
      logger.error(error.message)
      response.status(500).send({
        message: 'An error occurred while starting the job to export keys.',
      })
      return
    }
  }

  /**
   * Returns json with all the keys for a lock by worker job id
   */
  async getExportedKeys(request: Request, response: Response) {
    const jobId = request.params.jobId

    if (!jobId) {
      response.status(404).send({ message: 'Job not found.' })
      return
    }

    try {
      const file = await downloadJsonFromS3(
        config.storage.exportsBucket,
        jobId as string
      )

      if (!file) {
        response
          .status(202)
          .send({ message: 'Job is still processing. Please retry later.' })
        return
      }

      response.status(200).send(file)
      return
    } catch (error) {
      response
        .status(202)
        .send({ message: `Unknown job status. Error ${error}` })
      return
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
        response.status(404).send({
          message: 'No filterKey query found.',
        })
        return
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

      response.status(200).send({
        keys,
        meta: {
          total,
          page: Number(page),
          byPage: filters.max,
        },
      })
      return
    } catch (error) {
      response.status(500).send({
        message: 'Keys list could not be retrieved.',
      })
      return
    }
  }
}
