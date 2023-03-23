import { RequestHandler } from 'express'
import { createPricingForPurchase, defiLammaPrice } from '../../utils/pricing'
import { z } from 'zod'

const nullOrString = z.union([z.string(), z.null()])

const PriceBody = z.object({
  network: z.number(),
  lockAddress: z.string(),
  recipients: z.array(nullOrString),
  data: z.array(nullOrString).optional().default([]),
  referrers: z.array(nullOrString).optional().default([]),
})

export const amount: RequestHandler = async (request, response) => {
  const network = Number(request.params.network || 1)
  const amount = parseFloat(request.query.amount?.toString() || '1')
  const address =
    typeof request.query.address === 'string'
      ? request.query.address
      : undefined

  const result = await defiLammaPrice({
    network,
    amount,
    address,
  })
  return response.status(200).send({
    result,
  })
}

export const price: RequestHandler = async (request, response) => {
  const { network, lockAddress, recipients, data, referrers } =
    await PriceBody.parseAsync(request.body)
  const pricing = await createPricingForPurchase({
    network,
    lockAddress,
    recipients,
    referrers,
    data,
  })

  return response.send(pricing)
}
