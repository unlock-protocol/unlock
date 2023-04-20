import { RequestHandler } from 'express'
import { createTotalCharges, defiLammaPrice } from '../../utils/pricing'

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
  // const network = Number(request.params.network)
  const recipients = request.query.recipients || []

  return response.send({
    prices: recipients.map((r: string) => {
      return {
        userAddress: r,
        amount: 12.34,
        symbol: '$',
        decimals: 0,
      }
    }),
    total: 1234 + 123, // in cents!
  })
}
