import { RequestHandler } from 'express'
import { createPricingForPurchase } from '../../utils/pricing'
import { ethers } from 'ethers'
import { getCreditCardEnabledStatus } from '../../operations/creditCardOperations'
import * as Normalizer from '../../utils/normalizer'
import { Web3Service } from '@unlock-protocol/unlock-js'
import networks from '@unlock-protocol/networks'
import * as pricingOperations from '../../operations/pricingOperations'

const MIN_PAYMENT_STRIPE = 100
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

  const result = await pricingOperations.getDefiLammaPrice({
    network,
    erc20Address: lock?.currencyContractAddress,
    amount: Number(`${lock.keyPrice}`),
  })

  const creditCardEnabled = await getCreditCardEnabledStatus({
    lockAddress: Normalizer.ethereumAddress(lockAddress),
    network,
    totalPriceInCents: result.priceInAmount ?? 0,
  })

  return response.status(200).send({ creditCardEnabled })
}
