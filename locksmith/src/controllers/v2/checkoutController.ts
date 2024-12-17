import { RequestHandler } from 'express'
import {
  getCheckoutConfigById,
  saveCheckoutConfig,
  getCheckoutConfigsByUser,
  deleteCheckoutConfigById,
} from '../../operations/checkoutConfigOperations'
import { PaywallConfig } from '@unlock-protocol/core'
import { Payload } from '../../models/payload'
import { addJob } from '../../worker/worker'

/**
 * Create or update a checkout configuration.
 *
 * This endpoint handles both creation of new configs and updates to existing ones.
 * It performs authorization checks for updates and sanitizes input before persistence.
 *
 */
export const createOrUpdateCheckoutConfig: RequestHandler = async (
  request,
  response
) => {
  const id: string | undefined = request.params.id
  const { config, name } = request.body
  if (!(config && name)) {
    response.status(400).send({
      message: 'Missing config or name',
    })
    return
  }
  try {
    const checkoutConfig = await PaywallConfig.strip().parseAsync(config)

    const storedConfig = await saveCheckoutConfig({
      id,
      name,
      config: checkoutConfig,
      user: request.user!.walletAddress,
    })
    response.status(200).send({
      id: storedConfig.id,
      by: storedConfig.createdBy,
      name: storedConfig.name,
      config: storedConfig.config,
      updatedAt: storedConfig.updatedAt.toISOString(),
      createdAt: storedConfig.createdAt.toISOString(),
    })
    return
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === 'User not authorized to update this configuration'
    ) {
      response.status(403).send({
        message: error.message,
      })
      return
    }
    throw error
  }
}

/**
 * Retrieve a specific checkout configuration.
 *
 * This endpoint fetches the requested config without performing an authorization check.
 */
export const getCheckoutConfig: RequestHandler = async (request, response) => {
  const id = request.params.id

  const checkoutConfig = await getCheckoutConfigById(id)
  if (!checkoutConfig) {
    response.status(404).send({
      message: 'No config found',
    })
    return
  }

  response.status(200).send(checkoutConfig)
  return
}

/**
 * Retrieve all checkout configurations for a user.
 *
 * This endpoint returns all configurations that a user is authorized to manage.
 * It's useful for populating user dashboards or configuration lists.
 */
export const getCheckoutConfigs: RequestHandler = async (request, response) => {
  const userAddress = request.user!.walletAddress
  const checkoutConfigs = await getCheckoutConfigsByUser(userAddress)

  response.status(200).send({
    results: checkoutConfigs.map((config) => {
      return {
        id: config.id,
        name: config.name,
        by: config.createdBy,
        config: config.config,
        updatedAt: config.updatedAt.toISOString(),
        createdAt: config.createdAt.toISOString(),
      }
    }),
  })
  return
}

/**
 * Delete a checkout configuration.
 *
 * This endpoint performs an authorization check before attempting to delete the config.
 * It ensures that only authorized users can delete a given configuration.
 *
 * TODO: Consider implementing soft delete for audit trail purposes.
 */
export const deleteCheckoutConfig: RequestHandler = async (
  request,
  response
) => {
  const id = request.params.id
  const userAddress = request.user!.walletAddress

  const existingConfig = await getCheckoutConfigById(id)

  if (!existingConfig) {
    response.status(404).send({
      message: 'Config not found.',
    })
    return
  }

  const deleted = await deleteCheckoutConfigById(userAddress, id)

  if (!deleted) {
    response.status(403).send({
      message: 'You do not have permission to delete this configuration.',
    })
    return
  }

  response.status(200).send({
    message: 'Config deleted',
  })
  return
}

export const updateCheckoutHooks: RequestHandler = async (
  request,
  response
) => {
  const { id } = request.params
  const userAddress = request.user!.walletAddress
  const payload = request.body

  try {
    const existingConfig = await getCheckoutConfigById(id)

    if (!existingConfig) {
      response.status(404).send({
        message: 'No config found',
      })
      return
    }

    const updatedConfig = {
      ...existingConfig.config,
      hooks: {
        ...existingConfig.config.hooks,
        ...payload,
      },
    }

    const checkoutConfig = await PaywallConfig.strip().parseAsync(updatedConfig)

    const storedConfig = await saveCheckoutConfig({
      id,
      name: existingConfig.name,
      config: checkoutConfig,
      user: userAddress,
    })

    response.status(200).send({
      id: storedConfig.id,
      by: storedConfig.createdBy,
      name: storedConfig.name,
      config: storedConfig.config,
      updatedAt: storedConfig.updatedAt.toISOString(),
      createdAt: storedConfig.createdAt.toISOString(),
    })
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === 'User not authorized to update this configuration'
    ) {
      response.status(403).send({
        message: error.message,
      })
      return
    }

    if (error instanceof Error) {
      response.status(400).send({
        message: 'Invalid hooks payload',
        error: error.message,
      })
      return
    }

    throw error
  }
}

export const getCheckoutHookJobs: RequestHandler = async (
  request,
  response
) => {
  const userAddress = request.user!.walletAddress

  try {
    const jobs = await Payload.findAll({
      where: {
        payload: {
          by: userAddress,
          read: false,
        },
      },
      order: [['createdAt', 'DESC']],
    })

    if (!jobs) {
      response
        .status(404)
        .send({ message: 'No unread checkout hook jobs found for this user.' })
      return
    }

    response.status(200).send(jobs)
  } catch (error: any) {
    response.status(400).send({ message: 'Could not retrieve jobs.' })
  }
}

export const addCheckoutHookJob: RequestHandler = async (request, response) => {
  const { id } = request.params
  const userAddress = request.user!.walletAddress

  const checkout = await getCheckoutConfigById(id)

  if (checkout?.by !== userAddress) {
    response.status(403).send({ message: 'Not authorized to add job.' })
  }

  try {
    const payloadData = request.body

    const payload = new Payload()
    payload.payload = {
      checkoutId: id,
      by: userAddress,
      status: 'pending',
      read: false,
      ...payloadData,
    }
    await payload.save()

    const job = await addJob('checkoutHookJob', payload)

    response.status(200).send({
      message: 'Job added successfully',
      job,
    })
  } catch (error) {
    response.status(400).send({ message: 'Could not add job.' })
  }
}

export const updateCheckoutHookJob: RequestHandler = async (
  request,
  response
) => {
  const payloadId = request.params.id
  const userAddress = request.user!.walletAddress

  try {
    const job = await Payload.findByPk(payloadId)
    if (!job) {
      response.status(404).send({ message: 'No existing job found to update.' })
      return
    }

    if (job.payload.by !== userAddress) {
      response.status(403).send({ message: 'Not authorized to update job.' })
    }

    job.payload = {
      ...job.payload,
      read: true,
    }
    await job.save()

    response.status(200).send({
      message: 'Job marked as read successfully',
      job,
    })
  } catch (error) {
    response.status(400).send({ message: 'Could not update job.' })
  }
}
