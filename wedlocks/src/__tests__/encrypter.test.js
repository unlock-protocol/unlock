import forge from 'node-forge'
import { signParam } from '../encrypter'
import { vi, beforeAll, afterAll } from 'vitest'

beforeAll(() => {
  vi.useFakeTimers()
})

afterAll(() => {
  vi.clearAllTimers()
})

const createKeyPair = async () => {
  return new Promise((resolve) => {
    forge.rsa.generateKeyPair(
      { bits: 2048, workers: 2 },
      function (err, keypair) {
        if (err) {
          throw err
        }

        const privateKey = forge.pki.privateKeyToPem(keypair.privateKey)
        const publicKey = forge.pki.publicKeyToPem(keypair.publicKey)
        resolve({ privateKey, publicKey })
      }
    )
  })
}

describe('encrypter', () => {
  let privateKey
  let publicKey
  beforeEach(async () => {
    vi.useFakeTimers()
    const keypair = await createKeyPair()
    privateKey = keypair.privateKey
    publicKey = keypair.publicKey
  })

  describe('signParam', () => {
    it('should provide an signed string which can be decrypted with the public key', () => {
      expect.assertions(1)

      const original = Buffer.from('Hello my name is Julien')
      const signed = signParam(original, privateKey)

      const md = forge.md.sha1.create()
      md.update(original, 'utf8')

      const signature = Buffer.from(
        decodeURIComponent(signed),
        'base64'
      ).toString('utf-8')

      const verified = forge.pki
        .publicKeyFromPem(publicKey)
        .verify(md.digest().bytes(), signature)

      expect(verified).toEqual(true)
    })
  })
})
