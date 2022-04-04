import { ironSession } from 'iron-session/express'
import { SiweMessage } from 'siwe'
import type { Request, Response, NextFunction } from 'express'

declare module 'iron-session' {
  interface IronSessionData {
    nonce: string | null
    siwe: SiweMessage | null
  }
}

export const sessionMiddleware: (
  request: Request,
  response: Response,
  next: NextFunction
) => Promise<unknown> = ironSession({
  cookieName: 'locksmith-token',
  password: process.env.SECRET_COOKIE_PASSWORD!,
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
})
