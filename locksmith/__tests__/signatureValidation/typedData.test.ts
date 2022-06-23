/* eslint-disable no-shadow  */
import { ethers } from 'ethers'
import signatureValidationMiddleware from '../../src/middlewares/signatureValidationMiddleware'

const httpMocks = require('node-mocks-http')
const Base64 = require('../../src/utils/base64')

let request: any
let response: any

const validSignature =
  '0x869568dc19561e6820671a556afb199cd35a2c1e141e8992aec235c2a662e8c97ae03c639d284b9102cffb4af86339a195d8acdc4b5c5deb3e68d430a81c265a1b'
const validSig2 =
  '0x49792512ab963f229eeaf9c64a43c7ca8a106a2217b06ade3496cdb5568740157b8eb69c1828df6c7687b83da4cda886f0b74406f55766a6172ffb604f97d1581c'

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
            User: [{ name: 'publicKey', type: 'address' }],
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

        const wallet = new ethers.Wallet(
          '0xfd8abdd241b9e7679e3ef88f05b31545816d6fbcaf11e86ebd5a57ba281ce229'
        )

        const { domain, types, message } = body
        const sig = await wallet._signTypedData(domain, types, message['user'])

        const request = httpMocks.createRequest({
          headers: { Authorization: `Bearer ${Base64.encode(sig)}` },
          query: {
            data: encodeURIComponent(JSON.stringify(body)),
          },
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
      it('moves the request to the application', (done) => {
        expect.assertions(1)
        const request = httpMocks.createRequest({
          headers: { Authorization: `Bearer ${Base64.encode(validSig2)}` },
          body: {
            types: {
              User: [
                { name: 'emailAddress', type: 'string' },
                { name: 'publicKey', type: 'address' },
                { name: 'passwordEncryptedPrivateKey', type: 'string' },
              ],
            },
            domain: { name: 'Unlock', version: '1' },
            primaryType: 'User',
            message: {
              user: {
                emailAddress: 'new_user@example.com',
                publicKey: '0x976EA74026E726554dB657fA54763abd0C3a0aa9',
                passwordEncryptedPrivateKey: 'an encrypted value',
              },
            },
            messageKey: 'user',
          },
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
        processor(request, response, function next() {
          expect(request.owner).toBe(
            '0x976EA74026E726554dB657fA54763abd0C3a0aa9'
          )
          done()
        })
      })
    })

    describe('a signature for Lock metadata', () => {
      it('moves the request to the application', (done) => {
        expect.assertions(1)
        Date.now = jest.fn(() => 1546130835000)
        const request = httpMocks.createRequest({
          headers: { Authorization: `Bearer ${Base64.encode(validSignature)}` },

          body: {
            types: {
              Lock: [
                { name: 'name', type: 'string' },
                { name: 'owner', type: 'address' },
                { name: 'address', type: 'address' },
              ],
            },
            domain: { name: 'Unlock Dashboard', version: '1', chainId: 31337 },
            primaryType: 'lock',
            message: {
              lock: {
                name: 'New Lock',
                owner: '0x976EA74026E726554dB657fA54763abd0C3a0aa9',
                address: '0x21cC9C438D9751A3225496F6FD1F1215C7bd5D83',
              },
            },
            messageKey: 'lock',
          },
        })

        processor = signatureValidationMiddleware.generateProcessor({
          name: 'lock',
          required: ['name', 'owner', 'address'],
          signee: 'owner',
        })
        processor(request, response, function next() {
          expect(request.owner).toBe(
            '0x976EA74026E726554dB657fA54763abd0C3a0aa9'
          )
          done()
        })
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
      test('returns a status 401 to the caller', () => {
        expect.assertions(1)
        const request = httpMocks.createRequest({
          headers: { Authorization: `Bearer ${validSignature}` },
        })

        const spy = jest.spyOn(response, 'status')
        processor(request, response)
        expect(spy).toHaveBeenCalledWith(401)
      })
    })

    describe('when the signature is malformed', () => {
      test('returns a  status 401 to the caller', () => {
        expect.assertions(1)
        const request = httpMocks.createRequest({
          headers: { Authorization: `Bearer ${validSignature}xyz` },

          body: {
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
          },
        })

        const spy = jest.spyOn(response, 'status')
        processor(request, response)
        expect(spy).toHaveBeenCalledWith(401)
      })
    })

    describe('when the signee does not match the item owner', () => {
      test('returns a status 401 to the caller ', () => {
        expect.assertions(1)
        const request = httpMocks.createRequest({
          headers: { Authorization: `Bearer ${validSignature}` },

          body: {
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
          },
        })

        const spy = jest.spyOn(response, 'status')
        processor(request, response)
        expect(spy).toHaveBeenCalledWith(401)
      })
    })
  })
})
