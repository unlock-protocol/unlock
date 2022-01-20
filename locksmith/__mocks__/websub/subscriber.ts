import { setupServer } from 'msw/node'
import { rest } from 'msw'
import { createSignature } from '../../src/websub/helpers'

const handlers = [
  rest.post('http://localhost:4000/callback', (req, res, ctx) => {
    const signature = req.headers.get('x-hub-signature')
    if (!signature) {
      return res(ctx.status(400), ctx.text('Missing signature'))
    }

    const [algo, hash] = signature.split('=')
    const computedHash = createSignature({
      content: String(req.body),
      algorithm: algo,
      secret: 'secret',
    })

    if (hash !== computedHash) {
      return res(ctx.status(400), ctx.text('Invalid signature'))
    }

    return res(ctx.status(200), ctx.text('Acknowledged'))
  }),
]

export const subscriberServer = setupServer(...handlers)
