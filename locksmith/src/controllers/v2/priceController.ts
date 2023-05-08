import { RequestHandler } from 'express'
import { createTotalCharges, defiLammaPrice } from '../../utils/pricing'
import Normalizer from '../../utils/normalizer'

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
  const keysToPurchase = Number(request.query.keysToPurchase?.toString() || 1)
  const lockAddress =
    typeof request.query.lockAddress === 'string'
      ? Normalizer.ethereumAddress(request.query.lockAddress as string)
      : undefined

  const address =
    typeof request.query.address === 'string'
      ? request.query.address
      : undefined

  const charge = await createTotalCharges({
    network,
    amount,
    address,
    lockAddress,
    keysToPurchase,
  })
  return response.send(charge)
}
