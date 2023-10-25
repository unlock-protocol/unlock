import { RequestHandler } from 'express'
import { PaywallConfig } from '@unlock-protocol/core'
import { CheckoutConfig } from '../../models'
import {
  getCheckoutConfigById,
  saveCheckoutConfig,
} from '../../operations/checkoutConfigOperations'

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
  const checkoutConfig = await PaywallConfig.strip().parseAsync(config)
  const createdConfig = await saveCheckoutConfig({
    id,
    name,
    config: checkoutConfig,
    createdBy: request.user!.walletAddress,
  })
  return response.status(200).send({
    id: createdConfig.id,
    by: createdConfig.createdBy,
    name: createdConfig.name,
    config: createdConfig.config,
    updatedAt: createdConfig.updatedAt.toISOString(),
    createdAt: createdConfig.createdAt.toISOString(),
  })
}

export const getCheckoutConfig: RequestHandler = async (request, response) => {
  const id = request.params.id
  const checkoutConfig = await getCheckoutConfigById(id)
  const statusCode = checkoutConfig ? 200 : 404
  const json = checkoutConfig
    ? checkoutConfig
    : {
        message: 'No config found',
      }
  return response.status(statusCode).send(json)
}

export const getCheckoutConfigsByUser: RequestHandler = async (
  request,
  response
) => {
  const userAddress = request.user!.walletAddress
  const checkoutConfigs = await CheckoutConfig.findAll({
    where: {
      createdBy: userAddress,
    },
    order: [['updatedAt', 'DESC']],
  })
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

export const deleteCheckoutConfig: RequestHandler = async (
  request,
  response
) => {
  const id = request.params.id
  const userAddress = request.user!.walletAddress
  const checkoutConfig = await CheckoutConfig.findOne({
    where: {
      id,
      createdBy: userAddress,
    },
  })
  if (!checkoutConfig) {
    return response.status(404).send({
      message: 'Not found',
    })
  }
  await checkoutConfig.destroy()
  return response.status(200).send({
    message: 'Config deleted',
  })
}
