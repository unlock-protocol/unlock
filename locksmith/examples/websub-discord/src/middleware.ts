import type { Request, Response, NextFunction } from 'express'
import { createSignature } from './util'

interface CreateWebsubMiddlewareOptions {
  secret?: string
}

export function createWebsubMiddleware({
  secret,
}: CreateWebsubMiddlewareOptions) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.body?.hub?.challenge) {
      return res.json(req.body)
    } else {
      if (secret && !req.headers['x-hub-signature']) {
        return res
          .status(400)
          .send('No x-hub-signature header with valid signature provided.')
      }
      if (req.headers['x-hub-signature'] && secret) {
        const signHeader = req.headers['x-hub-signature'] as string
        const [algorithm, signature] = signHeader.split('=')
        const computedSignature = createSignature({
          secret,
          algorithm,
          content: JSON.stringify(req.body),
        })
        if (computedSignature === signature) {
          return next()
        } else {
          return res.status(400).send('Invalid signature.')
        }
      }
      return next()
    }
  }
}
