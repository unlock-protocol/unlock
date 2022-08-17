import { Request, Response } from 'express'
import { ErrorTypes, generateNonce, SiweMessage } from 'siwe'
import { Op } from 'sequelize'
import { logger } from '../../logger'
import { RefreshToken } from '../../models/refreshToken'
import {
  createAccessToken,
  createRandomToken,
} from '../../utils/middlewares/auth'
import dayjs from 'dayjs'

export class AuthController {
  async login(request: Request, response: Response) {
    try {
      if (!request.body.message) {
        response.status(422).json({
          message: 'Expected message object as body.',
        })
      }
      const message = new SiweMessage(request.body.message)
      const fields = await message.validate(request.body.signature)

      // Avoid replay attack.
      const isNonceLoggedIn = await RefreshToken.findOne({
        where: {
          nonce: fields.nonce,
        },
      })
      if (isNonceLoggedIn) {
        logger.info(`${fields.nonce} was already used for login.`)
        response.status(422).json({
          message: 'Invalid nonce',
        })
      }

      const accessToken = createAccessToken({
        walletAddress: fields.address,
        type: 'user',
      })

      const refreshTokenData = new RefreshToken()

      refreshTokenData.walletAddress = fields.address
      refreshTokenData.nonce = fields.nonce
      refreshTokenData.token = createRandomToken()

      const { token: refreshToken } = await refreshTokenData.save()

      response
        .setHeader('refresh-token', refreshToken)
        .setHeader('Authorization', `Bearer ${accessToken}`)
        .send({
          walletAddress: fields.address,
          accessToken,
          refreshToken,
        })
    } catch (error) {
      logger.error(error.message)
      switch (error) {
        case ErrorTypes.EXPIRED_MESSAGE: {
          response.status(440).json({ message: error.message })
          break
        }
        case ErrorTypes.INVALID_SIGNATURE: {
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

  async token(request: Request, response: Response) {
    try {
      const refreshToken =
        request.body.refreshToken ||
        request.headers['refresh-token']?.toString()

      if (!refreshToken) {
        return response.status(401).send({
          message: 'No refresh token provided in the header or body.',
        })
      }

      const refreshTokenData = await RefreshToken.findOne({
        where: {
          token: refreshToken,
          revoked: {
            [Op.or]: [null, false],
          },
        },
      })

      if (!refreshTokenData) {
        return response.status(401).send({
          message: 'Refresh token provided is invalid or revoked.',
        })
      }

      const lifeTime = dayjs(new Date()).diff(
        dayjs(refreshTokenData.createdAt),
        'days'
      )

      // if refresh token is older than 30 days
      if (lifeTime > 30) {
        return response.status(401).send({
          message: 'Refresh token provided is invalid or revoked.',
        })
      }

      const accessToken = createAccessToken({
        walletAddress: refreshTokenData.walletAddress,
        type: 'user',
      })

      return response
        .status(200)
        .setHeader('Authorization', `Bearer ${accessToken}`)
        .send({
          walletAddress: refreshTokenData.walletAddress,
          accessToken: accessToken,
        })
    } catch (error) {
      logger.error(error.message)
      return response.status(500).send({
        message: 'Failed to issue new token',
      })
    }
  }

  async logout(request: Request, response: Response) {
    try {
      const user = request.user!
      await RefreshToken.update(
        {
          revoked: true,
        },
        {
          where: {
            walletAddress: user.walletAddress,
          },
        }
      )
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

  async revokeToken(request: Request, response: Response) {
    try {
      const refreshToken =
        request.body.refreshToken ||
        request.headers['refresh-token']?.toString()

      if (!refreshToken) {
        return response.status(401).send({
          message: 'No refresh token provided.',
        })
      }

      await RefreshToken.update(
        {
          revoked: true,
        },
        {
          where: {
            token: refreshToken,
          },
        }
      )

      return response.status(200).send({
        message: 'Revoked',
      })
    } catch (error) {
      logger.error(error.message)
      return response.status(500).send({
        message: 'Failed to revoke token',
      })
    }
  }

  user(request: Request, response: Response) {
    return response.status(200).send(request.user)
  }

  async nonce(_: Request, response: Response) {
    const nonce = generateNonce()
    return response
      .status(200)
      .setHeader('content-type', 'text/html')
      .setHeader('nonce', nonce)
      .send(nonce)
  }
}
