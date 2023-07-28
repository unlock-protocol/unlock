import { createSignature } from '../../src/worker/helpers'
import { Request } from 'express'

export const handler = (req: Request) => {
  // @ts-expect-error  Argument of type 'IncomingHttpHeaders' is not assignable to parameter of type 'Iterable<readonly [PropertyKey, any]>'.
  const headers = Object.fromEntries(req.headers)
  const signature = headers['x-hub-signature']

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
