import { RequestHandler } from 'express'
import { PaywallConfig } from '@unlock-protocol/core'
import { CheckoutConfig } from '../../models'
import { randomUUID } from 'node:crypto'

export const createOrUpdateCheckoutConfig: RequestHandler = async (
  request,
  response
) => {
  const id: string | undefined = request.params.id
  const config = await PaywallConfig.strip().parseAsync(request.body.config)
  const userAddress = request.user!.walletAddress
  const generatedId = randomUUID()
  const [createdConfig] = await CheckoutConfig.upsert(
    {
      id: id || generatedId,
      config,
      createdBy: userAddress,
    },
    {
      conflictFields: ['id', 'createdBy'],
    }
  )
  return response.status(200).send({
    id: createdConfig.id,
    by: createdConfig.createdBy,
    config: createdConfig.config,
  })
}

export const getCheckoutConfig: RequestHandler = async (request, response) => {
  const id = request.params.id
  const checkoutConfig = await CheckoutConfig.findOne({
    where: {
      id,
    },
  })
  const statusCode = checkoutConfig ? 200 : 404
  return response.status(statusCode).send({
    id: checkoutConfig?.id,
    by: checkoutConfig?.createdBy,
    config: checkoutConfig?.config,
  })
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
  })
  return response.status(200).send({
    results: checkoutConfigs.map((config) => {
      return {
        id: config.id,
        by: config.createdBy,
        config: config.config,
      }
    }),
  })
}
