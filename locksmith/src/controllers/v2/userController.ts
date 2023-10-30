import { RequestHandler } from 'express'
import { updateUser } from '../../operations/userOperations'
import { z } from 'zod'

const UpdateUserBody = z.object({
  emailAddress: z
    .string()
    .email({ message: 'Invalid email address' })
    .transform((value) => value.toLowerCase()),
})

export const update: RequestHandler = async (request, response) => {
  const userUpdate = UpdateUserBody.parse(request.body)
  const user = await updateUser(request.user!.walletAddress, userUpdate)

  if (!user) {
    return response.sendStatus(404)
  }
  return response.json(user)
}
