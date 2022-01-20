import { setupServer } from 'msw/node'
import crypto from 'crypto'
import { rest } from 'msw'

const handlers = [
  rest.post('http://localhost:4000/callback', (req, res, ctx) => {
    const signature = req.headers.get('x-hub-signature')
    if (!signature) {
      return res(ctx.status(400), ctx.text('Missing signature'))
    }

    const [algo, hash] = signature.split('=')
    const computedHash = crypto
      .createHmac(algo, 'websub')
      .update(JSON.stringify(req.body))
      .digest('hex')

    if (hash !== computedHash) {
      return res(ctx.status(400), ctx.text('Invalid signature'))
    }

    return res(ctx.status(200), ctx.text('Acknowledged'))
  }),
]

export const subscriberServer = setupServer(...handlers)
