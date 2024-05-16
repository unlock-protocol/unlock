import { RequestHandler } from 'express'
import { PaywallLocksConfigType } from '@unlock-protocol/core'
import { EventBody } from '../../controllers/v2/eventsController'
import { isEventOrganizer } from '../eventOrganizers'

export const eventOrganizerMiddleware: RequestHandler = async (
  request,
  response,
  next
) => {
  const userAddress = request.user!.walletAddress

  let locks: PaywallLocksConfigType = {}

  let slug = request.params.slug

  if (!slug) {
    const parsed = await EventBody.parseAsync(request.body)

    locks = parsed.checkoutConfig.config.locks
    slug = parsed.data.slug

    return next()
  }

  const isLockManager = await isEventOrganizer(userAddress, slug)

  if (isLockManager == undefined) {
    return response.status(404).send({
      message: `No such event`,
    })
  }

  if (isLockManager == false) {
    return response.status(403).send({
      message: `${userAddress} is not a lock manager of this transaction`,
    })
  }

  return next()
}
