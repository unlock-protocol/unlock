import { RequestHandler } from 'express'
import { generateNonce, SiweMessage, SiweErrorType } from 'siwe'
import { logger } from '../../logger'
import { Session } from '../../models/Session'
import { createAccessToken } from '../../utils/middlewares/auth'
import dayjs from '../../config/dayjs'
import config from '../../config/config'
import normalizer from '../../utils/normalizer'
import { ethers } from 'ethers'
import { networks } from '@unlock-protocol/networks'
// Temporary since SIWE does not seem to support ERC-6492
import { verifyMessage } from '@ambire/signature-validator'

export const login: RequestHandler = async (request, response) => {
  try {
    if (!request.body?.message) {
      response.status(422).json({
        message: 'Expected message object as body.',
      })
      return
    }
    const message = new SiweMessage(request.body.message)

    const networkConfig = networks[message.chainId || 1]
    let provider
    if (networkConfig) {
      provider = new ethers.JsonRpcProvider(networkConfig.publicProvider)
    }
    let verified
    try {
      verified = await message.verify(
        {
          signature: request.body.signature,
        },
        { provider }
      )
    } catch (error) {
      // Temporary fix since the siwe library does not support ERC 6492
      if (
        error.error.shortMessage === 'could not decode result data' &&
        provider
      ) {
        try {
          if (
            await verifyMessage({
              signer: message.address,
              message: message.toMessage(),
              signature: request.body.signature,
              // @ts-expect-error Type 'JsonRpcProvider' is missing the following properties from type 'Provider': getGasPrice, getStorageAt, sendTransaction, getBlockWithTransactions, _isProvider
              provider,
            })
          ) {
            verified = {
              success: true,
              data: message,
            }
          }
        } catch (error) {
          logger.error(
            `SIWE message verification with 6492 failed: ${error.message}`
          )
          response.status(500).json({ message: error.message })
          return
        }
      } else {
        switch (error) {
          case SiweErrorType.EXPIRED_MESSAGE: {
            response.status(440).json({ message: error.message })
            return
          }
          case SiweErrorType.INVALID_SIGNATURE: {
            response.status(422).json({ message: error.message })
            return
          }
          default: {
            logger.error(`SIWE message verification failed: ${error.message}`)
            response.status(500).json({ message: error.message })
            return
          }
        }
      }
    }

    if (!verified) {
      response.status(422).json({ message: 'Signature is not valid!' })
      return
    }

    const { data: fields } = verified
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
    response.status(500).json({ message: error.message })
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
    if (!id) {
      // Missing id... so we can't revoke
      return response.status(400).send({
        message: 'Missing id, cannot revoke',
      })
    }
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
