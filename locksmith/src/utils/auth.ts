import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { RequestHandler, response } from 'express'
import { Op } from 'sequelize'
import { Application } from '../models/application'
import { logger } from '../logger'

export type User =
  | {
      type: 'user'
      walletAddress: string
    }
  | {
      type: 'application'
      walletAddress: string
      clientId: string
    }

declare global {
  namespace Express {
    interface Request {
      user?: User
    }
  }
}

export const jwtConfig = {
  tokenSecret: process.env.JWT_TOKEN_SECRET ?? 'access-token-secret',
  expire: process.env.JWT_EXPIRE ?? '3600',
}

export function createRandomToken() {
  return crypto.randomBytes(128).toString('hex')
}

export function createAccessToken(user: User) {
  return jwt.sign(user, jwtConfig.tokenSecret, {
    expiresIn: jwtConfig.expire,
    algorithm: 'HS256',
  })
}

export const authMiddleware: RequestHandler = async (req, _, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader) {
      return next()
    }

    const [type, token] = authHeader.split(' ')
    const tokenType = type.toLowerCase()

    if (tokenType === 'bearer') {
      const user = jwt.verify(token, jwtConfig.tokenSecret) as User
      req.user = user
      return next()
    }

    if (tokenType === 'basic') {
      const [id, secret] = Buffer.from(token, 'base64')
        .toString('utf-8')
        .split(':')

      const app = await Application.findOne({
        where: {
          id,
          secret,
          revoked: {
            [Op.or]: [null, false],
          },
        },
      })

      if (!app) {
        throw new Error(`Application with API KEY: ${token} not found.`)
      }

      req.user = {
        type: 'application',
        walletAddress: app.walletAddress,
        clientId: app.id,
      }
      return next()
    }

    return response.status(401).send({
      message: 'Unsupported authorization type',
    })
  } catch (error) {
    logger.error(error.message)
    return next()
  }
}

export const authenticatedMiddleware: RequestHandler = (req, res, next) => {
  if (!req.user) {
    return res.status(403).send({
      message: 'You are not authenticated.',
    })
  }
  return next()
}
