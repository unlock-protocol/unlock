import { ironSession } from 'iron-session/express'
import { SiweMessage } from 'siwe'
import type { Request, Response, NextFunction } from 'express'
import type { IronSessionOptions } from 'iron-session'

declare module 'iron-session' {
  interface IronSessionData {
    nonce: string | null
    siwe: SiweMessage | null
  }
}
export const sessionOptions: IronSessionOptions = {
  cookieName: 'locksmith',
  password:
    process.env.SECRET_COOKIE_PASSWORD ??
    '32-characters-long-secret-cookie-password',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
}

export const sessionMiddleware: (
  request: Request,
  response: Response,
  next: NextFunction
) => Promise<unknown> = ironSession(sessionOptions)
