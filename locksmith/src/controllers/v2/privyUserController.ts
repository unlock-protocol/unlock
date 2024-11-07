import { RequestHandler } from 'express'
import {
  getPrivyUserByEmail,
  getPrivyUserByAddress,
} from '../../operations/privyUserOperations'
import logger from '../../logger'

export const checkPrivyUser: RequestHandler = async (request, response) => {
  const { email, address } = request.body

  if (!email && !address) {
    response.status(400).json({
      error: 'Either email or wallet address must be provided',
    })
    return
  }

  try {
    let result
    if (email) {
      result = await getPrivyUserByEmail(email)
    } else {
      result = await getPrivyUserByAddress(address)
    }

    if (!result.success) {
      response.status(500).json({
        error: result.error,
      })
      return
    }

    response.status(200).json({
      exists: !!result.user,
      user: result.user || null,
    })
  } catch (error) {
    logger.error('Error checking Privy user:', error)
    response.status(500).json({
      error: 'Failed to check Privy user',
    })
  }
}
