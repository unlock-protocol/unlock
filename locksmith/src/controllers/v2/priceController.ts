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
 * TODO: actually implement this!
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

  // For universal card, we actually apply the unlock fee to each lock
  // And split gas between them all
  const fees = (pricing.total - pricing.creditCardProcessingFee) / 100
  const result = {
    prices: pricing.recipients.map((recipient: any) => {
      return {
        userAddress: recipient.address,
        amount: recipient.amountInUSD + fees / pricing.recipients.length,
        symbol: '$',
      }
    }),
  }

  return response.send(result)
}
