import { Request, Response } from 'express'
import Normalizer from '../../utils/normalizer'
import logger from '../../logger'
import * as keysOperations from '../../operations/keysOperations'
import { PAGE_SIZE } from '@unlock-protocol/core'
import { randomUUID } from 'node:crypto'
import { JobStore } from '../../models/jobs'

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

  async allKeys(request: Request, response: Response) {
    try {
      const jobId = randomUUID()

      JobStore.createJob(jobId)

      response.status(200).send({ jobId })

      this.processAndStoreJsonData(request, jobId).catch((error) => {
        console.error(
          `Failed to process data for job ${jobId}: ${error.message}`
        )
        JobStore.updateJob(jobId, 'failed', { error: error.message })
      })
    } catch (error) {
      console.error(error.message)
      return response.status(500).send({
        message: 'An error occurred while starting the JSON processing job.',
      })
    }
    return
  }

  async processAndStoreJsonData(request: Request, jobId: string) {
    JobStore.updateJob(jobId, 'processing')

    try {
      const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)
      const network = Number(request.params.network)
      const {
        query = '',
        filterKey,
        expiration = 'active',
        approval = 'minted',
      } = request.query ?? {}

      if (!filterKey) {
        JobStore.updateJob(jobId, 'failed', {
          error: 'No filterKey query found.',
        })
      }

      // const loggedInUserAddress = Normalizer.ethereumAddress(request!.user!.walletAddress)

      let allKeys: any = []
      let page = 0
      const max = PAGE_SIZE
      let totalFetched = 0
      let totalPages = Infinity

      while (page < totalPages) {
        const filters = { query, page, filterKey, expiration, approval, max }

        const { keys, total } = await keysOperations.getKeysWithMetadata({
          network,
          lockAddress,
          filters,
          loggedInUserAddress: '0x13e8F3A5a8A52eBC7351f5bEc5B06F8D7208Fc05',
        })

        allKeys = [...allKeys, ...keys]
        totalFetched += keys.length
        page++

        totalPages = Math.ceil(total / PAGE_SIZE)

        if (keys.length === 0) {
          break
        }
      }

      JobStore.updateJob(jobId, 'completed', {
        keys: allKeys,
        meta: {
          total: totalFetched,
          pages: totalPages,
          byPage: PAGE_SIZE,
        },
      })
    } catch (error) {
      console.error(error.message)
      JobStore.updateJob(jobId, 'failed', {
        error: error.message,
      })
    }
  }

  async getJobResult(request: Request, response: Response) {
    const { jobId } = request.query

    console.log(jobId)

    const job = JobStore.getJob(jobId as string)
    console.log(job)
    if (!job) {
      return response.status(404).send({ message: 'Job not found.' })
    }

    switch (job.status) {
      case 'processing':
        return response
          .status(202)
          .send({ message: 'Job is still processing. Please retry later.' })
      case 'completed':
        // JobStore.removeJob(jobId as string)
        return response.status(200).send(job.data)
      case 'failed':
        //JobStore.removeJob(jobId as string)
        return response.status(500).send({ message: `Job failed: ${job.data}` })
      default:
        //JobStore.removeJob(jobId as string)
        return response.status(400).send({ message: 'Invalid job status.' })
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
