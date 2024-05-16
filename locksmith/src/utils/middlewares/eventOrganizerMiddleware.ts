import { RequestHandler } from 'express'
import { isEventOrganizer } from '../eventOrganizers'

export const eventOrganizerMiddleware: RequestHandler = async (
  request,
  response,
  next
) => {
  const userAddress = request.user!.walletAddress

  let slug = request.params.slug

  if (!slug) {
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
