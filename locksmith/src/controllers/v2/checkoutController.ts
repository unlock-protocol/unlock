import { RequestHandler } from 'express'
import {
  getCheckoutConfigById,
  saveCheckoutConfig,
  deleteCheckoutConfigOperation,
  getCheckoutConfigsByUserOperation,
} from '../../operations/checkoutConfigOperations'

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
    return response.status(400).send({
      message: 'Missing config or name',
    })
  }

  try {
    const createdConfig = await saveCheckoutConfig({
      id,
      name,
      config,
      user: request.user!.walletAddress,
    })

    if (!createdConfig) {
      return response.status(403).send({
        message:
          'Unauthorized: You do not have permission to create or update this configuration.',
      })
    }

    return response.status(200).send({
      id: createdConfig.id,
      by: createdConfig.createdBy,
      name: createdConfig.name,
      config: createdConfig.config,
      updatedAt: createdConfig.updatedAt.toISOString(),
      createdAt: createdConfig.createdAt.toISOString(),
    })
  } catch (error) {
    console.error('Error creating/updating checkout config:', error)
    return response.status(500).send({
      message: 'An error occurred while processing your request.',
    })
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
    return response.status(404).send({
      message: 'No config found',
    })
  }

  return response.status(200).send(checkoutConfig)
}

/**
 * Retrieve all checkout configurations for a user.
 *
 * This endpoint returns all configurations that a user is authorized to manage.
 * It's useful for populating user dashboards or configuration lists.
 */
export const getCheckoutConfigsByUser: RequestHandler = async (
  request,
  response
) => {
  const userAddress = request.user!.walletAddress
  const checkoutConfigs = await getCheckoutConfigsByUserOperation(userAddress)

  return response.status(200).send({
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
    return response.status(404).send({
      message: 'Config not found.',
    })
  }

  const deleted = await deleteCheckoutConfigOperation(userAddress, id)

  if (!deleted) {
    return response.status(403).send({
      message: 'You do not have permission to delete this configuration.',
    })
  }

  return response.status(200).send({
    message: 'Config deleted',
  })
}
