import { RequestHandler } from 'express'
import * as priceOperations from '../../operations/pricingOperations'
import { createPricingForPurchase } from '../../utils/pricing'
import { ethers } from 'ethers'
import { getCreditCardEnabledStatus } from '../../operations/creditCardOperations'
import * as Normalizer from '../../utils/normalizer'
import { Web3Service } from '@unlock-protocol/unlock-js'
import networks from '@unlock-protocol/networks'
import { MIN_PAYMENT_STRIPE } from '../../utils/constants'

export const amount: RequestHandler = async (request, response) => {
  const network = Number(request.params.network || 1)
  const amount = parseFloat(request.query.amount?.toString() || '1')
  const erc20Address = request.query.address?.toString()
  const address = ethers.utils.isAddress(erc20Address || '')
    ? erc20Address
    : undefined

  const _lockAddress = request.query.lockAddress?.toString()
  const keysToPurchase = Number(request.query.keysToPurchase?.toString() || 1)

  const lockAddress =
    _lockAddress && ethers.utils.isAddress(_lockAddress || '')
      ? Normalizer.ethereumAddress(_lockAddress)
      : undefined

  const result = await priceOperations.getUsdPricingForLock({
    network,
    amount,
    address,
    lockAddress,
    keysToPurchase,
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

  const _lockAddress = request.query.lockAddress?.toString()
  const keysToPurchase = Number(request.query.keysToPurchase?.toString() || 1)

  const lockAddress =
    _lockAddress && ethers.utils.isAddress(_lockAddress || '')
      ? Normalizer.ethereumAddress(_lockAddress)
      : undefined

  const charge = await priceOperations.getTotalCharges({
    amount,
    network,
    address,
    lockAddress,
    keysToPurchase,
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

  const total = pricing.total - pricing.creditCardProcessingFee

  // For universal card, the creditCardProcessingFee fee is applied by Stripe directly
  // Stripe minimum payment is 1$ (100 cents)
  const creditCardProcessingFee =
    total < MIN_PAYMENT_STRIPE ? MIN_PAYMENT_STRIPE - total : 0

  return response.send({
    creditCardProcessingFee,
    unlockServiceFee: pricing.unlockServiceFee,
    gasCost: pricing.gasCost,
    total: total + creditCardProcessingFee,
    prices: [
      ...pricing.recipients.map((recipient) => {
        return {
          userAddress: recipient.address,
          amount: recipient.price.amount,
          symbol: '$',
        }
      }),
    ],
  })
}

export const isCardPaymentEnabledForLock: RequestHandler = async (
  request,
  response
) => {
  const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)
  const network = Number(request.params.network)

  const web3Service = new Web3Service(networks)
  const lock = await web3Service.getLock(lockAddress, network)

  const result = await priceOperations.getDefiLammaPrice({
    network,
    address: lock?.currencyContractAddress,
    amount: Number(`${lock.keyPrice}`),
  })

  const creditCardEnabled = await getCreditCardEnabledStatus({
    lockAddress: Normalizer.ethereumAddress(lockAddress),
    network,
    totalPriceInCents: result.priceInAmount ?? 0,
  })

  return response.status(200).send({ creditCardEnabled })
}
