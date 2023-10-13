import { RequestHandler } from 'express'
import { updateUser } from '../../operations/userOperations'

export const update: RequestHandler = async (request, response) => {
  const user = await updateUser(request.user!.walletAddress, request.body)

  if (!user) {
    return response.sendStatus(404)
  }
  return response.json(user)
}
