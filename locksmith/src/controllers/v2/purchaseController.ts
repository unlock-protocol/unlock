import { Response, Request } from 'express-serve-static-core'
import {
  getStripeCustomerIdForAddress,
  createStripeCustomer,
} from '../../operations/stripeOperations'
import PaymentProcessor from '../../payment/paymentProcessor'
import * as Normalizer from '../../utils/normalizer'
import logger from '../../logger'
const config = require('../../../config/config')

export class PurchaseController {
  processor = new PaymentProcessor(config.stripeSecret)
  async createSetupIntent(request: Request, response: Response) {
    try {
      const userAddress = Normalizer.ethereumAddress(
        request.user!.walletAddress
      )
      let stripeCustomerId = await getStripeCustomerIdForAddress(userAddress)
      if (!stripeCustomerId) {
        stripeCustomerId = await createStripeCustomer(undefined, userAddress)
      }

      const setupIntent = await this.processor.createSetupIntent({
        customerId: stripeCustomerId,
      })

      return response.status(201).send(setupIntent)
    } catch (error) {
      logger.error(error.message)
      return response.status(500).send({
        error: 'Unable to create setupIntent',
      })
    }
  }

  async list(request: Request, response: Response) {
    try {
      const userAddress = Normalizer.ethereumAddress(
        request.user!.walletAddress
      )
      let customerId = await getStripeCustomerIdForAddress(userAddress)

      if (!customerId) {
        customerId = await createStripeCustomer(undefined, userAddress)
      }
      const methods = await this.processor.listCardMethods({
        customerId,
      })

      return response.status(200).send({
        methods,
      })
    } catch (error) {
      logger.error(error.message)
      return response.status(500).send({
        message: 'Unable to find methods associated with the account',
      })
    }
  }
}
