/* eslint-disable no-shadow  */
import { Wallet } from 'ethers'
import signatureValidationMiddleware from '../../src/middlewares/signatureValidationMiddleware'

import Base64 = require('../../src/utils/base64')

const httpMocks = require('node-mocks-http')

let request: any
let response: any

const wallets: Wallet[] = [
  new Wallet(
    '0xe5986c22698a3c1eb5f84455895ad6826fbdff7b82dbeee240bad0024469d93a'
  ),
  new Wallet(
    '0xfd8abdd241b9e7679e3ef88f05b31545816d6fbcaf11e86ebd5a57ba281ce229'
  ),
]

const body = {
  types: {
    Lock: [
      { name: 'name', type: 'string' },
      { name: 'owner', type: 'address' },
      { name: 'address', type: 'address' },
    ],
  },
  domain: { name: 'Unlock Dashboard', version: '1', chainId: 31337 },
  primaryType: 'Lock',
  message: {
    lock: {
      name: 'New Lock',
      owner: '0xc66ef2e0d0edcce723b3fdd4307db6c5f0dda1b8',
      address: '0x21cC9C438D9751A3225496F6FD1F1215C7bd5D83',
    },
  },
  messageKey: 'lock',
}

let processor = signatureValidationMiddleware.generateProcessor({
  name: 'lock',
  required: ['name', 'owner', 'address'],
  signee: 'owner',
})

const evaluator = signatureValidationMiddleware.generateSignatureEvaluator({
  name: 'user',
  required: ['publicKey'],
  signee: 'publicKey',
})

const generateSignature = async (wallet: Wallet, body: any) => {
  const sig = await wallet.signMessage(JSON.stringify(body))
  return sig
}

beforeAll(() => {
  request = httpMocks.createRequest()
  response = httpMocks.createResponse()
})

describe('Signature Validation Middleware', () => {
  describe('generateSignatureEvaluator', () => {
    describe('when the request has a token', () => {
      it('returns the signee', async () => {
        expect.assertions(1)

        const body = {
          types: {
            User: [{ name: 'publickKey', type: 'address' }],
          },
          domain: { name: 'Unlock', version: '1' },
          primaryType: 'User',
          message: {
            user: {
              publicKey: '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2',
            },
          },
          messageKey: 'user',
        }

        const sig = await generateSignature(wallets[1], body)
        const request = httpMocks.createRequest({
          headers: { Authorization: `Bearer-Simple ${Base64.encode(sig)}` },
          query: { data: encodeURIComponent(JSON.stringify(body)) },
        })

        const signee = await new Promise((resolve) => {
          evaluator(request, response, function next() {
            resolve(request.signee)
          })
        })

        expect(signee).toBe('0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2')
      })
    })

    describe('when the request does not have a token', () => {
      it('does not return a signee', (done) => {
        expect.assertions(1)

        const request = httpMocks.createRequest({
          body: 'a sample body',
        })

        evaluator(request, response, function next() {
          expect(request.signee).toBe(undefined)
          done()
        })
      })
    })
  })

  describe('when a valid signature is received', () => {
    describe('a signature for User creation', () => {
      it('moves the request to the application', async () => {
        expect.assertions(1)

        const body = {
          types: {
            User: [
              { name: 'emailAddress', type: 'string' },
              { name: 'publickKey', type: 'address' },
              { name: 'passwordEncryptedPrivateKey', type: 'string' },
            ],
          },
          domain: { name: 'Unlock', version: '1' },
          primaryType: 'User',
          message: {
            user: {
              emailAddress: 'new_user@example.com',
              publicKey: '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2',
              passwordEncryptedPrivateKey: 'an encrypted value',
            },
          },
          messageKey: 'user',
        }

        const sig = await generateSignature(wallets[1], body)
        const request = httpMocks.createRequest({
          headers: {
            Authorization: `Bearer-Simple ${Base64.encode(sig)}`,
          },
          body,
        })

        processor = signatureValidationMiddleware.generateProcessor({
          name: 'user',
          required: [
            'emailAddress',
            'publicKey',
            'passwordEncryptedPrivateKey',
          ],
          signee: 'publicKey',
        })

        const owner = await new Promise((resolve) => {
          processor(request, response, function next() {
            resolve(request.owner)
          })
        })

        expect(owner).toBe('0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2')
      })
    })

    describe('a signature for Lock metadata', () => {
      it('moves the request to the application', async () => {
        expect.assertions(1)
        Date.now = jest.fn(() => 1546130835000)

        const body = {
          types: {
            Lock: [
              { name: 'name', type: 'string' },
              { name: 'owner', type: 'address' },
              { name: 'address', type: 'address' },
            ],
          },
          domain: { name: 'Unlock Dashboard', version: '1', chainId: 31337 },
          primaryType: 'Lock',
          message: {
            lock: {
              name: 'New Lock',
              owner: '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2',
              address: '0x21cC9C438D9751A3225496F6FD1F1215C7bd5D83',
            },
          },
          messageKey: 'lock',
        }

        const sig = await generateSignature(wallets[1], body)
        const request = httpMocks.createRequest({
          headers: {
            Authorization: `Bearer-Simple ${Base64.encode(sig)}`,
          },
          body,
        })

        processor = signatureValidationMiddleware.generateProcessor({
          name: 'lock',
          required: ['name', 'owner', 'address'],
          signee: 'owner',
        })
        const owner = await new Promise((resolve) => {
          processor(request, response, function next() {
            resolve(request.owner)
          })
        })
        expect(owner).toBe('0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2')
      })
    })
  })

  describe('unauthorized conditions', () => {
    describe('when a signature is not provided', () => {
      test('returns a status 401 to the caller ', () => {
        expect.assertions(1)
        const spy = jest.spyOn(response, 'status')
        processor(request, response)
        expect(spy).toHaveBeenCalledWith(401)
      })
    })

    describe('when the body provided is not well formed Typed Data ', () => {
      test('returns a status 401 to the caller', async () => {
        expect.assertions(1)

        const validSignature = await generateSignature(wallets[0], body)
        const request = httpMocks.createRequest({
          headers: {
            Authorization: `Bearer-Simple ${Base64.encode(validSignature)}`,
          },
        })

        const spy = jest.spyOn(response, 'status')
        processor(request, response)
        expect(spy).toHaveBeenCalledWith(401)
      })
    })

    describe('when the signature is malformed', () => {
      test('returns a  status 401 to the caller', async () => {
        expect.assertions(1)

        const validSignature = await generateSignature(wallets[0], body)
        const request = httpMocks.createRequest({
          headers: { Authorization: `Bearer-Simple ${validSignature}xyz` },
          body,
        })

        const spy = jest.spyOn(response, 'status')
        processor(request, response)
        expect(spy).toHaveBeenCalledWith(401)
      })
    })

    describe('when the signee does not match the item owner', () => {
      test('returns a status 401 to the caller ', async () => {
        expect.assertions(1)

        const validSignature = await generateSignature(wallets[0], body)
        const request = httpMocks.createRequest({
          headers: { Authorization: `Bearer-Simple ${validSignature}` },
          body,
        })

        const spy = jest.spyOn(response, 'status')
        processor(request, response)
        expect(spy).toHaveBeenCalledWith(401)
      })
    })
  })
})
