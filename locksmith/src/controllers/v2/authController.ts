import { Request, Response } from 'express'
import { ErrorTypes, generateNonce, SiweMessage } from 'siwe'
import { Op } from 'sequelize'
import { logger } from '../../logger'
import { RefreshToken } from '../../models/refreshToken'
import { createAccessToken, createRefreshToken } from '../../utils/jwt'

export class AuthController {
  async login(request: Request, response: Response) {
    try {
      if (!request.body.message) {
        response.status(422).json({
          message: 'Expected prepareMessage object as body.',
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
      })

      const refreshTokenData = new RefreshToken()

      refreshTokenData.walletAddress = fields.address
      refreshTokenData.token = createRefreshToken()
      refreshTokenData.nonce = fields.nonce

      const { token: refreshToken } = await refreshTokenData.save()

      response
        .cookie('refresh-token', refreshToken, {
          expires: new Date(message.expirationTime!),
          httpOnly: process.env.NODE_ENV === 'production',
        })
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
        request.cookies['refresh-token'] ||
        request.body.refreshToken ||
        request.headers['refresh-token']?.toString()

      if (!refreshToken) {
        return response
          .status(401)
          .send('No refresh token provided in the header or body.')
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
        return response
          .status(401)
          .send('Refresh token provided is invalid or revoked.')
      }

      // rotate refresh token
      refreshTokenData.token = createRefreshToken()

      await refreshTokenData.save()

      const accessToken = createAccessToken({
        walletAddress: refreshTokenData.walletAddress,
      })

      return response
        .status(200)
        .setHeader('Authorization', `Bearer ${accessToken}`)
        .setHeader('refresh-token', refreshTokenData.token)
        .cookie('refresh-token', refreshTokenData.token, {
          httpOnly: process.env.NODE_ENV === 'production',
        })
        .send({
          walletAddress: refreshTokenData.walletAddress,
          refreshToken: refreshTokenData.token,
          accessToken: accessToken,
        })
    } catch (error) {
      logger.error(error.message)
      return response.status(500).send('Failed to issue new token')
    }
  }

  async revokeToken(request: Request, response: Response) {
    try {
      const refreshToken =
        request.body.refreshToken ||
        request.headers['refresh-token']?.toString()

      if (!refreshToken) {
        return response
          .status(401)
          .send('No refresh token provided in the header or body.')
      }

      const [count, [refreshTokenData]] = await RefreshToken.update(
        {
          revoked: true,
        },
        {
          where: {
            token: refreshToken,
          },
          returning: true,
        }
      )

      if (!count) {
        return response.status(404).send('No refresh token found.')
      }

      return response.status(200).send(refreshTokenData.revoked)
    } catch (error) {
      logger.error(error.message)
      return response.status(500).send('Failed to revoke token')
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
