import { RequestHandler } from 'express'
import { createTotalCharges, defiLammaPrice } from '../../utils/pricing'
import Normalizer from '../../utils/normalizer'

export const amount: RequestHandler = async (request, response) => {
  const network = Number(request.params.network || 1)
  const amount = parseFloat(request.query.amount?.toString() || '1')
  const tokenAddress =
    typeof request.query.tokenAddress === 'string'
      ? request.query.tokenAddress
      : undefined

  const result = await defiLammaPrice({
    network,
    amount,
    tokenAddress,
  })
  return response.status(200).send({
    result,
  })
}

export const total: RequestHandler = async (request, response) => {
  const network = Number(request.query.network?.toString() || 1)
  const keysToPurchase = Number(request.query.keysToPurchase?.toString() || 1)
  const amount = parseFloat(request.query.amount?.toString() || '1')
  const lockAddress = Normalizer.ethereumAddress(
    request.query.lockAddress as string
  )

  const tokenAddress =
    typeof request.query.tokenAddress === 'string'
      ? request.query.tokenAddress
      : undefined

  const charge = await createTotalCharges({
    network,
    amount,
    tokenAddress,
    lockAddress,
    keysToPurchase,
  })
  return response.send(charge)
}
