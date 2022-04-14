import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { RequestHandler } from 'express'

export interface User {
  walletAddress: string
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

export function createRefreshToken() {
  return crypto.randomBytes(128).toString('hex')
}

export function createAccessToken(user: User) {
  return jwt.sign(user, jwtConfig.tokenSecret, {
    expiresIn: jwtConfig.expire,
    algorithm: 'HS256',
  })
}

export const jwtMiddleware: RequestHandler = (req, _, next) => {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(' ')[1]

  if (token) {
    jwt.verify(token, jwtConfig.tokenSecret, (err: any, user: any) => {
      if (err) {
        return next()
      }
      req.user = user
      return next()
    })
  } else {
    next()
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
