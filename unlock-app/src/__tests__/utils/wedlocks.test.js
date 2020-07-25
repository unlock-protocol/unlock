import forge from 'node-forge'
import { Base64 } from 'js-base64'

import { verifyEmailSignature } from '../../utils/wedlocks'

const emailAddressToSign = 'julien@unlock-protocol.com'
let signature
let base64PublicKey

// These tests are slow because we generate private keys
jest.setTimeout(15000)

describe('verifyEmailSignature', () => {
  beforeAll((done) => {
    forge.rsa.generateKeyPair({ bits: 2048, workers: 2 }, function (
      err,
      keypair
    ) {
      const privateKeyPem = forge.pki.privateKeyToPem(keypair.privateKey)
      const publicKey = forge.pki.publicKeyToPem(keypair.publicKey)
      base64PublicKey = Base64.encode(publicKey)
      // First, let's create a signature!
      const md = forge.md.sha1.create()
      md.update(emailAddressToSign, 'utf8')
      const privateKey = forge.pki.privateKeyFromPem(privateKeyPem)
      const signed = privateKey.sign(md)
      signature = Buffer.from(signed).toString('base64')
      done()
    })
  })

  it('should return true if the signature matches the wedlocks public key', () => {
    expect.assertions(1)
    expect(
      verifyEmailSignature(emailAddressToSign, signature, base64PublicKey)
    ).toBe(true)
  })

  it('should return false if the signature does not match the wedlocks public key', () => {
    expect.assertions(1)
    const badSignature = Buffer.from('not a signature').toString('base64')
    expect(
      verifyEmailSignature(emailAddressToSign, badSignature, base64PublicKey)
    ).toBe(false)
  })

  it('should return false if the signature is for another email address', () => {
    expect.assertions(1)
    expect(
      verifyEmailSignature(
        'another@unlock-protocol.com',
        signature,
        base64PublicKey
      )
    ).toBe(false)
  })

  it('pulls the public key out of the config file if not provided in arguments', () => {
    expect.assertions(1)
    expect(verifyEmailSignature('another@unlock-protocol.com', signature)).toBe(
      false
    )
  })
})
