import { RequestHandler } from 'express'
import { getEventBySlug } from '../../operations/eventOperations'
import { getCheckoutConfigById } from '../../operations/checkoutConfigOperations'
import { isEmpty } from 'lodash'
import { Web3Service } from '@unlock-protocol/unlock-js'
import networks from '@unlock-protocol/networks'
import { PaywallLocksConfigType } from '@unlock-protocol/core'
import { EventBody } from '../../controllers/v2/eventsController'

// TODO: This middlewares duplicates code from the isEventOrganizer function
export const eventOrganizerMiddleware: RequestHandler = async (
  request,
  response,
  next
) => {
  const web3Service = new Web3Service(networks)
  const userAddress = request.user!.walletAddress

  let locks: PaywallLocksConfigType = {}

  let slug = request.params.slug

  if (!slug) {
    const parsed = await EventBody.parseAsync(request.body)

    locks = parsed.checkoutConfig.config.locks
    slug = parsed.data.slug
  }

  // If this is an existing event!
  if (slug) {
    const existingEvent = await getEventBySlug(
      slug,
      false /** includeProtected */
    )
    if (existingEvent?.checkoutConfigId) {
      const checkoutConfig = await getCheckoutConfigById(
        existingEvent.checkoutConfigId
      )
      locks = checkoutConfig?.config.locks || {}
    }
  }

  if (isEmpty(locks)) {
    return response.status(404).send({
      message: `No such event`,
    })
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
