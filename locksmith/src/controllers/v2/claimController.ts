import { RequestHandler } from 'express'
import { z } from 'zod'
import Dispatcher from '../../fulfillment/dispatcher'
import KeyPricer from '../../utils/keyPricer'
import normalizer from '../../utils/normalizer'

const ClaimBody = z.object({
  data: z.string().optional(),
})

export const claim: RequestHandler = async (request, response) => {
  const { data } = await ClaimBody.parseAsync(request.body)
  const network = Number(request.params.network)
  const lockAddress = normalizer.ethereumAddress(request.params.lockAddress)
  const owner = normalizer.ethereumAddress(request.user!.walletAddress)
  // First check that the lock is indeed free and that the gas costs is low enough!
  const pricer = new KeyPricer()
  const pricing = await pricer.generate(lockAddress, network)
  const fulfillmentDispatcher = new Dispatcher()

  if (pricing.keyPrice !== undefined && pricing.keyPrice > 0) {
    return response.status(500).send({
      message: 'Lock is not free!',
    })
  }

  const hasEnoughToPayForGas =
    await fulfillmentDispatcher.hasFundsForTransaction(network)
  if (!hasEnoughToPayForGas) {
    return response.status(500).send({
      message: 'Not enough funds to pay for gas',
    })
  }

  if (!(await pricer.canAffordGrant(network))) {
    return response.status(500).send({
      message: 'Gas fees too high!',
    })
  }

  await fulfillmentDispatcher.purchaseKey(
    {
      lockAddress,
      owner,
      network,
      data,
    },
    async (_: any, transactionHash: string) => {
      return response.send({
        transactionHash,
      })
    }
  )
  return response.sendStatus(200)
}
