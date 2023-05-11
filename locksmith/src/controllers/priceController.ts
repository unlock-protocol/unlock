import { Response } from 'express'
import KeyPricer from '../utils/keyPricer'
import { SignedRequest } from '../types'
import { getCreditCardEnabledStatus } from '../operations/creditCardOperations'
import * as Normalizer from '../utils/normalizer'

import logger from '../logger'

// This method will return the key price in USD by default, but can eventually be used to return prices in a different curreny (via query string)
export const fiatPrice = async (
  req: SignedRequest,
  res: Response
): Promise<any> => {
  const lockAddress = Normalizer.ethereumAddress(req.params.lockAddress)
  const quantity = Number(req.query.quantity || 1)
  const network = Number(req.query.chain || 1)
  try {
    const pricer = new KeyPricer()

    const pricing = await pricer.generate(lockAddress, req.chain, quantity)
    const totalPriceInCents = Object.values(pricing).reduce((a, b) => a + b)

    const creditCardEnabled = await getCreditCardEnabledStatus({
      lockAddress,
      network,
      totalPriceInCents,
    })

    return res.send({
      usd: pricing,
      creditCardEnabled,
    })
  } catch (error) {
    logger.error('PriceController.fiatPrice', error)
    // TODO: return a 500 error - work around for now to avoid breaking compatibility - response won't be cached
    return res.status(201).send({})
  }
}

const PriceController = {
  fiatPrice,
}

export default PriceController
