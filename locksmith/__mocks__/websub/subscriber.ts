import { createSignature } from '../../src/websub/helpers'
import { Request } from 'express'

export const handler = (req: Request) => {
  const signature = req.headers['x-hub-signature']?.toString()

  if (!signature) {
    return {
      status: 400,
      body: 'Missing signature',
    }
  }

  const [algo, hash] = signature.split('=')
  const body = JSON.parse(req.body)
  const computedHash = createSignature({
    content: JSON.stringify(body),
    algorithm: algo,
    secret: 'websub',
  })

  if (hash !== computedHash) {
    return {
      status: 400,
      body: 'Invalid signature',
    }
  }

  return {
    status: 200,
    body: 'Acknowledged',
  }
}
