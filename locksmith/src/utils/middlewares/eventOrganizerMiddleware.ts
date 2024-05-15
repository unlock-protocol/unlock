import { RequestHandler } from 'express'
import { isEventOrganizer } from '../getEventOrganizers'

export const eventOrganizerMiddleware: RequestHandler = async (
  request,
  response,
  next
) => {
  const userAddress = request.user!.walletAddress

  let slug = request.params.slug

  const isLockManager = await isEventOrganizer(userAddress, slug)

  if (!isLockManager) {
    return response.status(403).send({
      message: `${userAddress} is not an event manager`,
    })
  }

  return next()
}
