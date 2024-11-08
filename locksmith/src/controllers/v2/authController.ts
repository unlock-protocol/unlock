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
import { privy } from '../../utils/privyClient'

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

export const loginWithPrivy: RequestHandler = async (request, response) => {
  try {
    const { accessToken, identityToken } = request.body

    if (!accessToken) {
      response.status(400).json({ error: 'Access token is required' })
      return
    }

    if (!identityToken) {
      response.status(400).json({ error: 'Identity token is required' })
      return
    }

    if (!privy) {
      response.status(500).json({ error: 'Privy client is not initialized' })
      return
    }

    // Verify the access token using Privy
    const userAuthClaims = await privy.verifyAuthToken(accessToken)

    // Get the user's data using the identity token
    // the identity token needs to be gotten from the cookie
    // https://docs.privy.io/guide/react/users/identity-token
    const user = await privy.getUser({ idToken: identityToken })

    const wallet = user.linkedAccounts.find(
      (account) => account.type === 'wallet'
    )

    if (!wallet?.address) {
      response
        .status(400)
        .json({ error: 'User does not have a wallet address' })
      return
    }

    const walletAddress = normalizer.ethereumAddress(wallet.address)

    // Create a new session
    const expireAt = dayjs().add(config.sessionDuration, 'seconds').toDate()
    const { id } = await createAccessToken({
      walletAddress,
      nonce: userAuthClaims.userId,
      expireAt,
    })

    response.setHeader('Authorization', `Bearer ${id}`).send({
      walletAddress,
      accessToken: id,
    })
    return
  } catch (error) {
    console.error('Error in loginWithPrivy:', error)
    response.status(401).json({ error: 'Invalid access token' })
    return
  }
}

export const user: RequestHandler = (request, response) => {
  response.status(200).send({
    walletAddress: request.user?.walletAddress,
  })
  return
}

export const nonce: RequestHandler = (_, response) => {
  const nonce = generateNonce()
  response
    .status(200)
    .setHeader('content-type', 'text/html')
    .setHeader('nonce', nonce)
    .send(nonce)
  return
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
    response.status(200).send({
      message: 'Successfully logged out',
    })
    return
  } catch (error) {
    logger.error(error.message)
    response.status(500).send({
      message: 'Failed to logout',
    })
    return
  }
}

export const revoke: RequestHandler = async (request, response) => {
  try {
    const id = request.user?.session
    if (!id) {
      // Missing id... so we can't revoke
      response.status(400).send({
        message: 'Missing id, cannot revoke',
      })
      return
    }
    await Session.destroy({
      where: {
        id,
      },
      force: true,
    })
    response.status(200).send({
      message: 'Successfully revoked',
    })
    return
  } catch (error) {
    logger.error(error.message)
    response.status(500).send({
      message: 'Failed to revoke',
    })
    return
  }
}
