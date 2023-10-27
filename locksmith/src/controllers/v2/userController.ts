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
  const user = await updateUser(
    request.user!.walletAddress,
    UpdateUserBody.parse(request.body)
  )

  if (!user) {
    return response.sendStatus(404)
  }
  return response.json(user)
}
