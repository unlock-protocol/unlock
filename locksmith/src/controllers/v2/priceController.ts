import { RequestHandler } from 'express'
import { createPricingForPurchase } from '../../utils/pricing'
import { ethers } from 'ethers'
import { getCreditCardEnabledStatus } from '../../operations/creditCardOperations'
import * as Normalizer from '../../utils/normalizer'
import * as pricingOperations from '../../operations/pricingOperations'
import { MIN_PAYMENT_STRIPE_ONRAMP } from '../../utils/constants'
import logger from '../../logger'

export const amount: RequestHandler = async (request, response) => {
  const network = Number(request.params.network || 1)
  const amount = parseFloat(request.query.amount?.toString() || '1')
  const currencyContractAddress = request.query.address?.toString()
  const erc20Address = ethers.utils.isAddress(currencyContractAddress || '')
    ? currencyContractAddress
    : undefined

  const result = await pricingOperations.getDefiLammaPrice({
    network,
    amount,
    erc20Address,
  })
  return response.status(200).send({
    result,
  })
}

export const total: RequestHandler = async (request, response) => {
  const network = Number(request.query.network?.toString() || 1)
  const amount = parseFloat(request.query.amount?.toString() || '1')
  const currencyContractAddress = request.query.address?.toString()
  const erc20Address = ethers.utils.isAddress(currencyContractAddress || '')
    ? currencyContractAddress
    : undefined

  const charge = await pricingOperations.getTotalCharges({
    network,
    amount,
    erc20Address,
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
    total < MIN_PAYMENT_STRIPE_ONRAMP ? MIN_PAYMENT_STRIPE_ONRAMP - total : 0

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
  try {
    const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)
    const network = Number(request.params.network)
    const creditCardEnabled = await getCreditCardEnabledStatus({
      lockAddress: Normalizer.ethereumAddress(lockAddress),
      network,
    })
    return response.status(200).send({ creditCardEnabled })
  } catch (error) {
    logger.error(error)
    return response.status(200).send({ creditCardEnabled: false })
  }
}

/**
 * Get pricing for recipients + total charges with fees
 */
export const getTotalChargesForLock: RequestHandler = async (
  request,
  response
) => {
  const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)
  const network = Number(request.params.network)

  const { recipients: recipientQ = [], purchaseData = [] } = request.query

  // Setup values
  const recipients: string[] = Array.isArray(recipientQ)
    ? recipientQ.map((x) => x.toString())
    : [recipientQ.toString()]
  const data: string[] = Array.isArray(purchaseData)
    ? purchaseData.map((x) => x.toString())
    : [purchaseData.toString()]

  // `createPricingForPurchase` already includes the logic to returns credit custom credit card price when set
  const pricing = await createPricingForPurchase({
    lockAddress,
    network,
    recipients,
    referrers: Array.from({ length: recipients.length }).map(() => ''),
    data,
  })

  const { creditCardProcessingFee, unlockServiceFee, gasCost, total } = pricing

  return response.status(200).send({
    creditCardProcessingFee,
    unlockServiceFee,
    gasCost,
    total,
    prices: [
      ...pricing.recipients.map((recipient) => {
        return {
          userAddress: recipient.address,
          amount: recipient.price.amount,
          symbol: recipient.price.symbol,
        }
      }),
    ],
  })
}
