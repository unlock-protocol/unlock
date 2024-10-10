import { RequestHandler } from 'express'
import {
  getAuthorizedCheckoutConfigs,
  getCheckoutConfigById,
  isAuthorizedToManageConfig,
  saveCheckoutConfig,
  deleteCheckoutConfigOperation,
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
  const userAddress = request.user!.walletAddress

  if (!(config && name)) {
    return response.status(400).send({
      message: 'Missing config or name',
    })
  }

  if (id) {
    const authorized = await isAuthorizedToManageConfig(userAddress, id)
    if (!authorized) {
      return response.status(403).send({
        message:
          'Unauthorized: You must be a Lock Manager of at least one associated lock or the creator.',
      })
    }
  }

  try {
    const createdConfig = await saveCheckoutConfig({
      id,
      name,
      config,
      createdBy: userAddress,
    })

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
 * This endpoint performs an authorization check before returning the requested config.
 * It ensures that only authorized users can access a given configuration.
 */
export const getCheckoutConfig: RequestHandler = async (request, response) => {
  const id = request.params.id
  const userAddress = request.user!.walletAddress

  const authorized = await isAuthorizedToManageConfig(userAddress, id)
  if (!authorized) {
    return response.status(403).send({
      message: 'Unauthorized: You do not have access to this configuration.',
    })
  }

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
  const authorizedConfigs = await getAuthorizedCheckoutConfigs(userAddress)

  return response.status(200).send({
    results: authorizedConfigs,
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

  const deleted = await deleteCheckoutConfigOperation(userAddress, id)

  if (!deleted) {
    return response.status(403).send({
      message:
        'Unauthorized: You do not have permission to delete this configuration.',
    })
  }

  return response.status(200).send({
    message: 'Config deleted',
  })
}
