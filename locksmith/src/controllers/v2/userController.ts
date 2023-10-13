import { RequestHandler } from 'express'
import { updateUser } from '../../operations/userOperations'

export const update: RequestHandler = async (request, response) => {
  const { emailAddress } = request.params
  const user = await updateUser(emailAddress, request.user!.walletAddress)

  if (!user) {
    return response.sendStatus(404)
  }
  return response.json(user)
}
