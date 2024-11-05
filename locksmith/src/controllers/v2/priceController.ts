import { RequestHandler } from 'express'
import { createPricingForPurchase } from '../../utils/pricing'
import { ethers } from 'ethers'
import { getCreditCardEnabledStatus } from '../../operations/creditCardOperations'
import * as Normalizer from '../../utils/normalizer'
import * as pricingOperations from '../../operations/pricingOperations'
import logger from '../../logger'

export const amount: RequestHandler = async (request, response) => {
  const network = Number(request.params.network || 1)
  const amount = parseFloat(request.query.amount?.toString() || '1')
  const currencyContractAddress = request.query.address?.toString()
  const erc20Address = ethers.isAddress(currencyContractAddress || '')
    ? currencyContractAddress
    : undefined

  const result = await pricingOperations.getDefiLlamaPrice({
    network,
    amount,
    erc20Address,
  })
  response.status(200).send({
    result,
  })
  return
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
    response.status(200).send(creditCardEnabled)
    return
  } catch (error) {
    logger.error(error)
    response.status(200).send({ creditCardEnabled: false })
    return
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

  // `createPricingForPurchase` already includes the logic to returns credit custom credit card price when set,
  // as well as the currency.
  const pricing = await createPricingForPurchase({
    lockAddress,
    network,
    recipients,
    referrers: Array.from({ length: recipients.length }).map(() => ''),
    data,
  })

  if (!pricing) {
    response.status(400).send({ error: 'Pricing could not be computed.' })
    return
  }

  const {
    creditCardProcessingFee,
    unlockServiceFee,
    gasCost,
    total,
    currency,
  } = pricing

  response.status(200).send({
    currency,
    symbol: pricingOperations.getCurrencySymbol(currency),
    creditCardProcessingFee,
    unlockServiceFee,
    gasCost,
    total,
    prices: [
      ...pricing.recipients.map((recipient) => {
        return {
          userAddress: recipient.address,
          amount: recipient.price.amount,
          symbol: pricingOperations.getCurrencySymbol(currency),
        }
      }),
    ],
  })
  return
}
