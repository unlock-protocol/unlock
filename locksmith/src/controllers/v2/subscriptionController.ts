import { Response, Request } from 'express'
import { KeySubscription } from '../../models'
import normalizer from '../../utils/normalizer'
import subscriptionOperations, {
  Subscription,
} from '../../operations/subscriptionOperations'

export class SubscriptionController {
  /**
   * Get an active crypto or fiat subscription associated with the key. This will return next renewal date, possible number of renewals, approved number of renewals, and other details.
   */
  async getSubscription(request: Request, response: Response) {
    const network = Number(request.params.network)
    const lockAddress = normalizer.ethereumAddress(request.params.lockAddress)
    const keyId = Number(request.params.keyId)
    const userAddress = normalizer.ethereumAddress(request.user!.walletAddress)

    const subscriptions: Subscription[] =
      await subscriptionOperations.getSubscriptionsForLockByOwner({
        tokenId: keyId.toString(),
        owner: userAddress,
        network,
        lockAddress,
      })

    return response.status(200).send({
      subscriptions,
    })
  }

  /**
   * Cancel stripe subscription associated with key.
   */
  async cancelStripeSubscription(request: Request, response: Response) {
    const network = Number(request.params.network)
    const lockAddress = normalizer.ethereumAddress(request.params.lockAddress)
    const keyId = Number(request.params.keyId)
    const userAddress = normalizer.ethereumAddress(request.user!.walletAddress)
    await KeySubscription.destroy({
      where: {
        keyId,
        lockAddress,
        network,
        userAddress,
      },
    })
    return response.sendStatus(204)
  }
}
