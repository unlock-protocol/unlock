import { RequestHandler } from 'express'
import { EventBody } from '../../controllers/v2/eventsController'
import { Web3Service } from '@unlock-protocol/unlock-js'
import networks from '@unlock-protocol/networks'
import { CheckoutConfig, EventData } from '../../models'

export const eventOrganizerMiddleware: RequestHandler = async (
  request,
  response,
  next
) => {
  const web3Service = new Web3Service(networks)
  const userAddress = request.user!.walletAddress
  const parsed = await EventBody.parseAsync(request.body)

  let locks = parsed.checkoutConfig.config.locks || {}

  // If this is an existing event!
  if (parsed.id) {
    const existingEvent = await EventData.findOne({
      where: { id: parsed.id },
    })

    if (!existingEvent?.checkoutConfigId) {
      delete parsed.id // The event does not really exist
    } else {
      // ok the event exists!
      const checkoutConfig = await CheckoutConfig.findOne({
        where: {
          id: existingEvent.checkoutConfigId,
        },
      })
      locks = checkoutConfig?.config.locks || {}
    }
  }

  const lockManagers = await Promise.all(
    Object.keys(locks).map((lockAddress: string) => {
      const networkId = locks[lockAddress].network
      return web3Service.isLockManager(
        lockAddress,
        userAddress,
        Number(networkId)
      )
    })
  )

  const isLockManager = lockManagers.some((isManager) => isManager)

  if (!isLockManager) {
    return response.status(403).send({
      message: `${userAddress} is not a lock manager of this transaction`,
    })
  }

  return next()
}
