import { RequestHandler } from 'express'
import { Web3Service } from '@unlock-protocol/unlock-js'
import { PaywallLocksConfigType } from '@unlock-protocol/core'
import networks from '@unlock-protocol/networks'
import { getEventBySlug } from '../../operations/eventOperations'
import { getCheckoutConfigById } from '../../operations/checkoutConfigOperations'
import { EventBody } from '../../controllers/v2/eventsController'
import { isEmpty } from 'lodash'
import { isEventOrganizer } from '../eventOrganizers'

export const eventOrganizerMiddleware: RequestHandler = async (
  request,
  response,
  next
) => {
  const userAddress = request.user!.walletAddress

  let slug = request.params.slug
  let locks: PaywallLocksConfigType = {}

  if (!slug) {
    const parsed = await EventBody.parseAsync(request.body)

    locks = parsed.checkoutConfig.config.locks
    slug = parsed.data.slug
  }

  const isLockManager = isEventOrganizer(userAddress, slug)

  if (isLockManager === null) {
    return response.status(404).send({
      message: `No such event`,
    })
  }

  if (!isLockManager) {
    return response.status(403).send({
      message: `${userAddress} is not a lock manager of this transaction`,
    })
  }

  return next()
}
