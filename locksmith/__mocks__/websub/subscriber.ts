import { createSignature } from '../../src/websub/helpers'

export const handler = (req) => {
  const signature = req.headers.get('x-hub-signature')

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
