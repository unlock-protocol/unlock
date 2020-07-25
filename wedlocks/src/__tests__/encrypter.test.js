import forge from 'node-forge'
import { signParam } from '../encrypter'

let privateKey
let publicKey

// These tests are slow because we generate private keys
jest.setTimeout(15000)

describe('encrypter', () => {
  beforeEach((done) => {
    forge.rsa.generateKeyPair({ bits: 2048, workers: 2 }, function (
      err,
      keypair
    ) {
      privateKey = forge.pki.privateKeyToPem(keypair.privateKey)
      publicKey = forge.pki.publicKeyToPem(keypair.publicKey)
      done()
    })
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
