import httpMocks = require('node-mocks-http')
import express = require('express')
import signatureValidationMiddleware = require('../src/signatureValidationMiddleware')

let request: httpMocks.MockRequest<express.Request>, response: httpMocks.MockResponse<express.Response>
let validSignature =
  'MHhkYTk4ZDY0MjVkZTc1NjAyNjFlYTM0MzVmNzFkYjhhYmFlY2JjYzM1ZjczNWZhZDM0OGQ2ODZkZGM2OTM0ZWE1M2FjOTY2ZmNhYjNkZTA0NmNmMjdjOGY1YmI5NGQ3ZjA0NzY0NWU2ZTczN2I0ZTQwZjAzZjJkMDg4Y2E2NWMxMDFi'

beforeAll(() => {
  request = httpMocks.createRequest()
  response = httpMocks.createResponse()
})

describe('Signature Validation Middleware', () => {
  describe('when a valid signature is received', () => {
    it('moves the request to the application', done => {
      expect.assertions(1)
      Date.now = jest.fn(() => 1546130835000)
      var request = httpMocks.createRequest({
        headers: { Authorization: `Bearer ${validSignature}` },

        body: {
          types: {
            EIP712Domain: [
              { name: 'name', type: 'string' },
              { name: 'version', type: 'string' },
              { name: 'chainId', type: 'uint256' },
              { name: 'verifyingContract', type: 'address' },
              { name: 'salt', type: 'bytes32' },
            ],
            Lock: [
              { name: 'name', type: 'string' },
              { name: 'owner', type: 'address' },
              { name: 'address', type: 'address' },
            ],
          },
          domain: { name: 'Unlock Dashboard', version: '1', chainId: 1984 },
          primaryType: 'Lock',
          message: {
            lock: {
              name: 'New Lock',
              owner: '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2',
              address: '0x21cC9C438D9751A3225496F6FD1F1215C7bd5D83',
            },
          },
        },
      })

      signatureValidationMiddleware(request, response, function next() {
        expect(request.owner).toBe('0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2')
        done()
      })
    })
  })

  describe('unauthorized conditions', () => {
    describe('when a signature is not provided', () => {
      test('returns a status 401 to the caller ', () => {
        expect.assertions(1)
        const spy = jest.spyOn(response, 'sendStatus')
        signatureValidationMiddleware(request, response)
        expect(spy).toHaveBeenCalledWith(401)
      })
    })

    describe('when the body provided is not well formed Typed Data ', () => {
      test('returns a status 401 to the caller', () => {
        expect.assertions(1)
        var request = httpMocks.createRequest({
          headers: { Authorization: `Bearer ${validSignature}` },
        })

        const spy = jest.spyOn(response, 'sendStatus')
        signatureValidationMiddleware(request, response)
        expect(spy).toHaveBeenCalledWith(401)
      })
    })

    describe('when the signature is malformed', () => {
      test('returns a  status 401 to the caller', () => {
        expect.assertions(1)
        var request = httpMocks.createRequest({
          headers: { Authorization: `Bearer ${validSignature}` },

          body: {
            types: {
              EIP712Domain: [
                { name: 'name', type: 'string' },
                { name: 'version', type: 'string' },
                { name: 'chainId', type: 'uint256' },
                { name: 'verifyingContract', type: 'address' },
                { name: 'salt', type: 'bytes32' },
              ],
              Lock: [
                { name: 'name', type: 'string' },
                { name: 'owner', type: 'address' },
                { name: 'address', type: 'address' },
              ],
            },
            domain: { name: 'Unlock Dashboard', version: '1', chainId: 1984 },
            primaryType: 'Lock',
            message: {
              lock: {
                name: 'New Lock',
                owner: '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2',
                address: '0x21cC9C438D9751A3225496F6FD1F1215C7bd5D83',
              },
            },
          },
        })

        const spy = jest.spyOn(response, 'sendStatus')
        signatureValidationMiddleware(request, response)
        expect(spy).toHaveBeenCalledWith(401)
      })
    })

    describe('when the signee does not match the item owner', () => {
      test('returns a status 401 to the caller ', () => {
        expect.assertions(1)
        var request = httpMocks.createRequest({
          headers: { Authorization: `Bearer ${validSignature}` },

          body: {
            types: {
              EIP712Domain: [
                { name: 'name', type: 'string' },
                { name: 'version', type: 'string' },
                { name: 'chainId', type: 'uint256' },
                { name: 'verifyingContract', type: 'address' },
                { name: 'salt', type: 'bytes32' },
              ],
              Lock: [
                { name: 'name', type: 'string' },
                { name: 'owner', type: 'address' },
                { name: 'address', type: 'address' },
              ],
            },
            domain: { name: 'Unlock Dashboard', version: '1', chainId: 1984 },
            primaryType: 'Lock',
            message: {
              lock: {
                name: 'New Lock',
                owner: '0xc66ef2e0d0edcce723b3fdd4307db6c5f0dda1b8',
                address: '0x21cC9C438D9751A3225496F6FD1F1215C7bd5D83',
              },
            },
          },
        })

        const spy = jest.spyOn(response, 'sendStatus')
        signatureValidationMiddleware(request, response)
        expect(spy).toHaveBeenCalledWith(401)
      })
    })
  })
})
