import { randomUUID } from 'crypto'
import { CheckoutConfig } from '../models'

interface SaveCheckoutConfigArgs {
  id?: string
  name: string
  createdBy: string
  config: any // TODO: TYPE
}

// Creates or updates a checkout config
export const saveCheckoutConfig = async ({
  id,
  name,
  createdBy,
  config,
}: SaveCheckoutConfigArgs) => {
  const generatedId = randomUUID()
  const [createdConfig] = await CheckoutConfig.upsert(
    {
      name,
      id: id || generatedId,
      config,
      createdBy,
    },
    {
      conflictFields: ['id', 'createdBy'],
    }
  )
  return createdConfig
}

// Returns a checkout config by id
export const getCheckoutConfigById = async (id: string) => {
  const checkoutConfig = await CheckoutConfig.findOne({
    where: {
      id,
    },
  })
  if (checkoutConfig) {
    return {
      id: checkoutConfig.id,
      name: checkoutConfig.name,
      by: checkoutConfig.createdBy,
      config: checkoutConfig.config,
      updatedAt: checkoutConfig.updatedAt.toISOString(),
      createdAt: checkoutConfig.createdAt.toISOString(),
    }
  }
  return null
}
