import { RequestHandler } from 'express'
import { IsEventOrganizerEnum, isEventOrganizer } from '../eventOrganizers'

export const eventOrganizerMiddleware: RequestHandler = async (
  request,
  response,
  next
) => {
  const userAddress = request.user!.walletAddress

  const slug = request.params.slug

  if (!slug) {
    return next()
  }

  const isLockManager = await isEventOrganizer(userAddress, slug)

  if (isLockManager == IsEventOrganizerEnum.NO_EVENT) {
    return response.status(404).send({
      message: `No such event`,
    })
  }

  if (isLockManager == IsEventOrganizerEnum.NOT_ORGANIZER) {
    return response.status(403).send({
      message: `${userAddress} is not a lock manager of this transaction`,
    })
  }

  return next()
}
