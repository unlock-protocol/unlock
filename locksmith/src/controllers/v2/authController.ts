import { RequestHandler } from 'express'
import { generateNonce, SiweMessage, SiweErrorType } from 'siwe'
import { logger } from '../../logger'
import { Session } from '../../models/Session'
import { createAccessToken } from '../../utils/middlewares/auth'
import dayjs from 'dayjs'
import config from '../../config/config'
import normalizer from '../../utils/normalizer'
import { ethers } from 'ethers'
import { networks } from '@unlock-protocol/networks'

export const login: RequestHandler = async (request, response) => {
  try {
    if (!request.body?.message) {
      response.status(422).json({
        message: 'Expected message object as body.',
      })
      return
    }
    const message = new SiweMessage(request.body.message)

    const provider = new ethers.providers.JsonRpcProvider(
      networks[message.chainId].publicProvider
    )
    const { data: fields } = await message.verify(
      {
        signature: request.body.signature,
      },
      { provider }
    )
    // Avoid replay attack.
    const isNonceLoggedIn = await Session.findOne({
      where: {
        nonce: fields.nonce,
      },
    })

    if (isNonceLoggedIn) {
      logger.info(`${fields.nonce} was already used for login.`)
      response.status(422).json({
        message: 'Invalid nonce',
      })
      return
    }

    const expireAt = dayjs().add(config.sessionDuration, 'seconds').toDate()

    const { id, walletAddress } = await createAccessToken({
      walletAddress: normalizer.ethereumAddress(fields.address),
      nonce: fields.nonce,
      expireAt,
    })

    response.setHeader('Authorization', `Bearer ${id}`).send({
      walletAddress,
      accessToken: id,
    })
  } catch (error) {
    logger.error(error.message)
    switch (error) {
      case SiweErrorType.EXPIRED_MESSAGE: {
        response.status(440).json({ message: error.message })
        break
      }
      case SiweErrorType.INVALID_SIGNATURE: {
        response.status(422).json({ message: error.message })
        break
      }
      default: {
        response.status(500).json({ message: error.message })
        break
      }
    }
  }
}

export const user: RequestHandler = (request, response) => {
  return response.status(200).send({
    walletAddress: request.user?.walletAddress,
  })
}

export const nonce: RequestHandler = (_, response) => {
  const nonce = generateNonce()
  return response
    .status(200)
    .setHeader('content-type', 'text/html')
    .setHeader('nonce', nonce)
    .send(nonce)
}

export const logout: RequestHandler = async (request, response) => {
  try {
    const user = request.user!
    await Session.destroy({
      where: {
        walletAddress: user.walletAddress,
      },
      force: true,
    })
    return response.status(200).send({
      message: 'Successfully logged out',
    })
  } catch (error) {
    logger.error(error.message)
    return response.status(500).send({
      message: 'Failed to logout',
    })
  }
}

export const revoke: RequestHandler = async (request, response) => {
  try {
    const id = request.user?.session
    await Session.destroy({
      where: {
        id,
      },
      force: true,
    })
    return response.status(200).send({
      message: 'Successfully revoked',
    })
  } catch (error) {
    logger.error(error.message)
    return response.status(500).send({
      message: 'Failed to revoke',
    })
  }
}
