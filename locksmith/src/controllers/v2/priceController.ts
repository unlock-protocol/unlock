import { RequestHandler } from 'express'
import {
  createPricingForPurchase,
  createTotalCharges,
  defiLammaPrice,
} from '../../utils/pricing'

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

export const total: RequestHandler = async (request, response) => {
  const network = Number(request.query.network?.toString() || 1)
  const amount = parseFloat(request.query.amount?.toString() || '1')
  const address =
    typeof request.query.address === 'string'
      ? request.query.address
      : undefined

  const charge = await createTotalCharges({
    network,
    amount,
    address,
  })
  return response.send(charge)
}

/**
 * Gets the pricing for the universal card payment method
 * TODO: support swap and purchase to get the route in USDC if the lock is not USDC
 * @param request
 * @param response
 * @returns
 */
export const universalCard: RequestHandler = async (request, response) => {
  const network = Number(request.params.network)
  const lockAddress = request.params.lock
  const { recipients: recipientQ = [], purchaseData = [] } = request.query

  // Setup values
  const recipients: string[] = Array.isArray(recipientQ)
    ? recipientQ.map((x) => x.toString())
    : [recipientQ.toString()]
  const data: string[] = Array.isArray(purchaseData)
    ? purchaseData.map((x) => x.toString())
    : [purchaseData.toString()]

  // Ok so now we use the pricing API to get the price for each recipient!
  const pricing = await createPricingForPurchase({
    lockAddress,
    recipients,
    network,
    referrers: Array.from({ length: recipients.length }).map(() => ''),
    data,
  })

  // For universal card, the creditCardProcessingFee fee is applied by Stripe=
  const creditCardProcessingFee = pricing.creditCardProcessingFee
  pricing.total -= creditCardProcessingFee
  pricing.creditCardProcessingFee = 0

  pricing.recipients.forEach((_, index) => {
    pricing.recipients[index].symbol = '$'
  })

  return response.send(pricing)
}
