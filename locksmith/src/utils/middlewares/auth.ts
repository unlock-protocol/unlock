import crypto from 'crypto'
import { RequestHandler, response } from 'express'
import { Application } from '../../models/application'
import { logger } from '../../logger'
import normalizer from '../normalizer'
import { Session } from '../../models'
import { Op } from 'sequelize'

export type User =
  | {
      type: 'user'
      walletAddress: string
      session: string
    }
  | {
      id: number
      type: 'application'
      walletAddress: string
      session?: string
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
    interface Response {
      sendResponse: any
    }
  }
}

interface Options {
  walletAddress: string
  nonce: string
  expireAt: Date
}
export const createAccessToken = async ({
  walletAddress,
  nonce,
  expireAt,
}: Options) => {
  const session = new Session()
  session.walletAddress = walletAddress
  session.nonce = nonce
  session.expireAt = expireAt
  session.id = crypto.randomBytes(64).toString('hex')
  await session.save()
  return session
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
    session: token,
  }
}

export const authMiddleware: RequestHandler = async (req, _, next) => {
  try {
    const apiKey = req.query['api-key']
    if (apiKey) {
      const apiKeyValue = Array.isArray(apiKey) ? apiKey[0] : apiKey
      await authenticateWithApiKey(req, apiKeyValue.toString())
      return next()
    }
    const authHeader = req.headers.authorization

    if (!authHeader) {
      return next()
    }

    const [type, token] = authHeader.split(/ +/)
    const tokenType = type.toLowerCase()
    if (tokenType === 'api-key') {
      await authenticateWithApiKey(req, token)
      return next()
    }
    if (tokenType === 'bearer') {
      const session = await Session.findOne({
        where: {
          id: token,
          expireAt: {
            [Op.gt]: new Date(),
          },
        },
      })

      if (!session) {
        return next()
      }
      req.user = {
        type: 'user',
        session: session.id,
        walletAddress: normalizer.ethereumAddress(session.walletAddress),
      }
      return next()
    }
    return response.status(400).send({
      message: 'Unsupported authorization type',
    })
  } catch (error) {
    logger.info(error.message)
    return next()
  }
}

export const authenticatedMiddleware: RequestHandler = (req, res, next) => {
  if (!req.user?.walletAddress) {
    return res.status(401).send({
      message: 'You are not authenticated.',
    })
  }
  return next()
}

export const userOnlyMiddleware: RequestHandler = (req, res, next) => {
  if (req.user?.type === 'application') {
    return res.status(403).send({
      message: 'Applications are not authorized to use this endpoint.',
    })
  }
  return next()
}

export const applicationOnlyMiddleware: RequestHandler = (req, res, next) => {
  if (req.user?.type !== 'application') {
    return res.status(403).send({
      message: 'Only applications are authorized to use this endpoint.',
    })
  }
  return next()
}
