import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { RequestHandler, response } from 'express'
import { Application } from '../../models/application'
import { logger } from '../../logger'
import normalizer from '../normalizer'

export type User =
  | {
      type: 'user'
      walletAddress: string
    }
  | {
      type: 'application'
      walletAddress: string
      id: number
    }

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: User
      owner: string
      signee: string
      chain: number
    }
  }
}

export const jwtConfig = {
  tokenSecret: process.env.JWT_TOKEN_SECRET ?? 'access-token-secret',
  expire: process.env.JWT_EXPIRE ?? '30m',
}

export function createRandomToken() {
  return crypto.randomBytes(64).toString('hex')
}

export function createAccessToken(user: User) {
  return jwt.sign(user, jwtConfig.tokenSecret, {
    expiresIn: jwtConfig.expire,
    algorithm: 'HS256',
  })
}

export const authenticateWithApiKey = async (req: any, token: string) => {
  const app = await Application.findOne({
    where: {
      key: token,
    },
  })

  if (!app) {
    throw new Error(`Application with key: ${token} not found.`)
  }

  req.user = {
    type: 'application',
    walletAddress: normalizer.ethereumAddress(app.walletAddress),
    id: app.id,
  }
}

export const authMiddleware: RequestHandler = async (req, _, next) => {
  try {
    if (req.query['api-key']) {
      if (Array.isArray(req.query['api-key'])) {
        await authenticateWithApiKey(req, req.query['api-key'][0] as string)
      } else {
        await authenticateWithApiKey(req, req.query['api-key'] as string)
      }
      return next()
    }

    const authHeader = req.headers.authorization

    if (!authHeader) {
      return next()
    }

    const [type, token] = authHeader.split(' ')
    const tokenType = type.toLowerCase()

    if (tokenType === 'bearer') {
      const user = jwt.verify(token, jwtConfig.tokenSecret) as User
      req.user = {
        ...user,
        walletAddress: normalizer.ethereumAddress(user.walletAddress),
      }
      return next()
    }

    if (tokenType === 'api-key') {
      await authenticateWithApiKey(req, token)
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
    return res.status(401).send({
      message: 'You are not authenticated.',
    })
  }
  return next()
}

export const userOnlyMiddleware: RequestHandler = (req, res, next) => {
  if (req.user?.type === 'application') {
    return res.status(401).send({
      message: 'Applications are not authorized to use this endpoint.',
    })
  }
  return next()
}

export const applicationOnlyMiddleware: RequestHandler = (req, res, next) => {
  if (req.user?.type !== 'application') {
    return res.status(401).send({
      message: 'Only applications are authorized to use this endpoint.',
    })
  }
  return next()
}
