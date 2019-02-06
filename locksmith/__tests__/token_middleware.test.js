var httpMocks = require('node-mocks-http')
var authorizationHeader = require('./authorizationHeaders')
var tokenMiddleware = require('../src/tokenMiddleware')

let request, response

beforeAll(() => {
  request = httpMocks.createRequest()
  response = httpMocks.createResponse()
})

describe('Locksmith JWT Validation Middleware', () => {
  describe('when a valid token is received', () => {
    it('moves the request to the application', done => {
      expect.assertions(1)
      Date.now = jest.fn(() => 1546130835000)
      var request = httpMocks.createRequest({
        headers: {
          Authorization: `Bearer ${
            authorizationHeader.validAuthorizationHeader
          }`,
        },
        body: {
          address: 'jqa6dnp1',
          name: 'oioioi',
          expirationDuration: 2592000,
          keyPrice: '10000000000000000',
          maxNumberOfKeys: 10,
          owner: '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2',
        },
      })

      tokenMiddleware(request, response, function next() {
        expect(request.owner).toBe('0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2')
        done()
      })
    })
  })

  describe('unauthorized conditions', () => {
    describe('when a token is not provided', () => {
      test('returns a status 401 to the caller ', () => {
        expect.assertions(1)
        const spy = jest.spyOn(response, 'sendStatus')
        tokenMiddleware(request, response)
        expect(spy).toHaveBeenCalledWith(401)
      })
    })

    describe("when a token's header is not provided as valid JSON", () => {
      test('returns a status 401 to the caller', () => {
        expect.assertions(1)
        var request = httpMocks.createRequest({
          headers: {
            Authorization: 'Bearer abcdde.eyJuYW1lIjogInBlcnNvbiJ9.zcedfefed',
          },
        })

        const spy = jest.spyOn(response, 'sendStatus')
        tokenMiddleware(request, response)
        expect(spy).toHaveBeenCalledWith(401)
      })
    })

    describe("when a token's payload is not provided as valid JSON", () => {
      test('returns a  status 401 to the caller', () => {
        expect.assertions(1)
        var request = httpMocks.createRequest({
          headers: {
            Authorization:
              'Bearer e2lzczogJ3NlbGZpZSd9.YXNtd2RzZ25qa2VuZHNn.zcedfefed',
          },
        })

        const spy = jest.spyOn(response, 'sendStatus')
        tokenMiddleware(request, response)
        expect(spy).toHaveBeenCalledWith(401)
      })
    })

    describe('when an token not matching the signature is provided', () => {
      test('returns a status 401 to the caller ', () => {
        expect.assertions(1)
        var request = httpMocks.createRequest({
          headers: {
            Authorization: 'Bearer abcdde.wdsgrg.zcedfefed',
          },
        })

        const spy = jest.spyOn(response, 'sendStatus')
        tokenMiddleware(request, response)
        expect(spy).toHaveBeenCalledWith(401)
      })
    })

    describe('when the payload does not contain the iss claim', () => {
      test('returns a status 401 to the caller ', () => {
        expect.assertions(1)
        var request = httpMocks.createRequest({
          headers: {
            Authorization: `Bearer ${authorizationHeader.missingISS}`,
          },
        })

        const spy = jest.spyOn(response, 'sendStatus')
        tokenMiddleware(request, response)
        expect(spy).toHaveBeenCalledWith(401)
      })
    })

    describe('when the payload does not contain the iat claim', () => {
      test('returns a status 401 to the caller ', () => {
        expect.assertions(1)
        var request = httpMocks.createRequest({
          headers: {
            Authorization: `Bearer ${authorizationHeader.missingIAT}`,
          },
        })

        const spy = jest.spyOn(response, 'sendStatus')
        tokenMiddleware(request, response)
        expect(spy).toHaveBeenCalledWith(401)
      })
    })

    describe('when the payload does not contain the exp claim', () => {
      test('returns a status 401 to the caller ', () => {
        expect.assertions(1)
        var request = httpMocks.createRequest({
          headers: {
            Authorization: `Bearer ${authorizationHeader.missingExpiry}`,
          },
        })

        const spy = jest.spyOn(response, 'sendStatus')
        tokenMiddleware(request, response)
        expect(spy).toHaveBeenCalledWith(401)
      })
    })

    describe('when the payload contains an iss claim but it isnt the signee', () => {
      test('returns a status 401 to the caller ', () => {
        expect.assertions(1)
        var request = httpMocks.createRequest({
          headers: {
            Authorization: `Bearer ${authorizationHeader.nonsigneeIssuer}`,
          },
        })

        const spy = jest.spyOn(response, 'sendStatus')
        tokenMiddleware(request, response)
        expect(spy).toHaveBeenCalledWith(401)
      })
    })

    describe('when the expiry window is larger than expected', () => {
      test('returns a status 401 to the caller ', () => {
        expect.assertions(1)
        var request = httpMocks.createRequest({
          headers: {
            Authorization: `Bearer ${authorizationHeader.largeExpiryWindow}`,
          },
        })

        const spy = jest.spyOn(response, 'sendStatus')
        tokenMiddleware(request, response)
        expect(spy).toHaveBeenCalledWith(401)
      })
    })
  })
})
