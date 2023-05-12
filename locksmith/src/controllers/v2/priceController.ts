import { RequestHandler } from 'express'
import { createTotalCharges, defiLammaPrice } from '../../utils/pricing'
import { ethers } from 'ethers'
import { getCreditCardEnabledStatus } from '../../operations/creditCardOperations'
import * as Normalizer from '../../utils/normalizer'

export const amount: RequestHandler = async (request, response) => {
  const network = Number(request.params.network || 1)
  const amount = parseFloat(request.query.amount?.toString() || '1')
  const erc20Address = request.query.address?.toString()
  const address = ethers.utils.isAddress(erc20Address || '')
    ? erc20Address
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
  const erc20Address = request.query.address?.toString()
  const address = ethers.utils.isAddress(erc20Address || '')
    ? erc20Address
    : undefined

  const charge = await createTotalCharges({
    network,
    amount,
    address,
  })

  return response.send(charge)
}

export const getCreditCardDetails: RequestHandler = async (
  request,
  response
) => {
  const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)
  const network = Number(request.params.network)
  const erc20Address = request.query.address?.toString()
  const amount = parseFloat(request.query.amount?.toString() || '1')
  const address = ethers.utils.isAddress(erc20Address || '')
    ? erc20Address
    : undefined

  const result = await defiLammaPrice({
    network,
    amount,
    address,
  })

  const creditCardEnabled = await getCreditCardEnabledStatus({
    lockAddress: Normalizer.ethereumAddress(lockAddress),
    network,
    totalPriceInCents: result.priceInAmount ?? 0,
  })

  return response.status(200).send({ creditCardEnabled })
}
