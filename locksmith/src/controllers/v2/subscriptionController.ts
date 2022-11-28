import { Response, Request } from 'express-serve-static-core'
import { KeySubscription } from '../../models'
import normalizer from '../../utils/normalizer'

export class SubscriptionController {
  async getSubscription(request: Request, response: Response) {
    const network = Number(request.params.network)
    const lockAddress = normalizer.ethereumAddress(request.params.lockAddress)
    const keyId = Number(request.params.keyId)
    const userAddress = normalizer.ethereumAddress(request.user!.walletAddress)
    const subscription = await KeySubscription.findOne({
      where: {
        keyId,
        lockAddress,
        network,
        userAddress,
      },
    })

    return response.status(200).send(subscription?.toJSON() ?? {})
  }

  async cancelSubscription(request: Request, response: Response) {
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
