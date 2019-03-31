import signatureValidationMiddleware from '../src/middlewares/signatureValidationMiddleware'

var httpMocks = require('node-mocks-http')

let request, response
let validSignature =
  'MHhkYTk4ZDY0MjVkZTc1NjAyNjFlYTM0MzVmNzFkYjhhYmFlY2JjYzM1ZjczNWZhZDM0OGQ2ODZkZGM2OTM0ZWE1M2FjOTY2ZmNhYjNkZTA0NmNmMjdjOGY1YmI5NGQ3ZjA0NzY0NWU2ZTczN2I0ZTQwZjAzZjJkMDg4Y2E2NWMxMDFi'
let validSig2 =
  'MHg3ZTVmMzM3NzViOWQ3MGYwZWQ2NjZiMGE3MTMwMDgyZWY2NTEzMWZjYWRkODFmM2IzM2U4N2NlY2ZmYjUxYTZkNGE2YmUwM2FhZDUwZjM0MzNiMjQ1Y2NiNTliYmMxYmFmYWU0MDhlZmRkOTY3YjQ2M2UxYmMyZWE0YTA1ZjE0YjFi'

let processor = signatureValidationMiddleware.generateProcessor({
  name: 'lock',
  required: ['name', 'owner', 'address'],
  signee: 'owner',
})

beforeAll(() => {
  request = httpMocks.createRequest()
  response = httpMocks.createResponse()
})

describe('Signature Validation Middleware', () => {
  describe('when a valid signature is received', () => {
    describe('a signature for User creation', () => {
      it('moves the request to the application', done => {
        expect.assertions(1)
        var request = httpMocks.createRequest({
          headers: { Authorization: `Bearer ${validSig2}` },
          body: {
            types: {
              EIP712Domain: [
                { name: 'name', type: 'string' },
                { name: 'version', type: 'string' },
                { name: 'chainId', type: 'uint256' },
                { name: 'verifyingContract', type: 'address' },
                { name: 'salt', type: 'bytes32' },
              ],
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
            '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2'
          )
          done()
        })
      })
    })

    describe('a signature for Lock metadata', () => {
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

        processor = signatureValidationMiddleware.generateProcessor({
          name: 'lock',
          required: ['name', 'owner', 'address'],
          signee: 'owner',
        })
        processor(request, response, function next() {
          expect(request.owner).toBe(
            '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2'
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
        const spy = jest.spyOn(response, 'sendStatus')
        processor(request, response)
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
        processor(request, response)
        expect(spy).toHaveBeenCalledWith(401)
      })
    })

    describe('when the signature is malformed', () => {
      test('returns a  status 401 to the caller', () => {
        expect.assertions(1)
        var request = httpMocks.createRequest({
          headers: { Authorization: `Bearer ${validSignature}xyz` },

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
        processor(request, response)
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
        processor(request, response)
        expect(spy).toHaveBeenCalledWith(401)
      })
    })
  })
})
