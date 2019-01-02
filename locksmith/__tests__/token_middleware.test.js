var httpMocks = require('node-mocks-http')
var tokenMiddleware = require('../src/token_middleware')

let request, response, validAuthorizationHeader

beforeAll(() => {
  request = httpMocks.createRequest()
  response = httpMocks.createResponse()
  validAuthorizationHeader = {
    'Authorization':
      'Bearer eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJsb2NrIjp7ImFkZHJlc3MiOiJqcWE2ZG5wMSIsIm5hbWUiOiJvaW9pb2kiLCJleHBpcmF0aW9uRHVyYXRpb24iOjI1OTIwMDAsImtleVByaWNlIjoiMTAwMDAwMDAwMDAwMDAwMDAiLCJtYXhOdW1iZXJPZktleXMiOjEwLCJvd25lciI6IjB4QWFBZEVFRDRjMEI4NjFjQjM2ZjRjRTAwNmE5QzkwQkEyRTQzZmRjMiJ9LCJpYXQiOjE1NDYxMzA4MzUsImV4cCI6MTU0NjEzMDgzOCwiaXNzIjoiMHhBYUFkRUVENGMwQjg2MWNCMzZmNGNFMDA2YTlDOTBCQTJFNDNmZGMyIn0.0xd36a7842eda1b2267c08b204407f9e71024a2152ae772882a1fa41a02696aee578688f02ef6c301451de95793bde669198359f0820fb35f6ba1303e89727a52601',
  }
})

describe('Locksmith JWT Validation Middleware', () => {
  describe('when a valid token is received', () => {
    it('moves the request to the application', (done) => {
      Date.now = jest.fn(() => 1546130835000)
      var request = httpMocks.createRequest({ headers: validAuthorizationHeader, 
        body: {'address':'jqa6dnp1','name':'oioioi','expirationDuration':2592000,
          'keyPrice':'10000000000000000','maxNumberOfKeys':10,'owner':'0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2'}})

      tokenMiddleware(request, response, function next() {
        expect(request.owner).toEqual('0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2')
        done()
      })
    })
  })

  describe('unauthorized conditions', () => {
    describe('when a token is not provided', () => {
      test('returns a status 401 to the caller ', () => {
        const spy = jest.spyOn(response, 'sendStatus')
        tokenMiddleware(request, response)
        expect(spy).toHaveBeenCalledWith(401)
      })
    })

    describe('when a token\'s header is not provided as valid JSON', () => {
      test('returns a status 401 to the caller', () => {
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

    describe('when a token\'s payload is not provided as valid JSON', () => {
      test('returns a  status 401 to the caller', () => {
        var request = httpMocks.createRequest({
          headers: {
            Authorization: 'Bearer e2lzczogJ3NlbGZpZSd9.YXNtd2RzZ25qa2VuZHNn.zcedfefed',
          },
        })

        const spy = jest.spyOn(response, 'sendStatus')
        tokenMiddleware(request, response)
        expect(spy).toHaveBeenCalledWith(401)
      })
    })

    describe('when an token not matching the signature is provided', () => {
      test('returns a status 401 to the caller ', () => {

        var request = httpMocks.createRequest({
          header: {
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
        var headerMissingISS = 'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJsb2NrIjp7ImFkZHJlc3MiOiJqcWE1OGh4ciIsIm5hbWUiOiJOZXcgTG9jayIsImV4cGlyYXRpb25EdXJhdGlvbiI6MjU5MjAwMCwia2V5UHJpY2UiOiIxMDAwMDAwMDAwMDAwMDAwMCIsIm1heE51bWJlck9mS2V5cyI6MTAsIm93bmVyIjoiMHhBYUFkRUVENGMwQjg2MWNCMzZmNGNFMDA2YTlDOTBCQTJFNDNmZGMyIn0sImlhdCI6MTU0NjEyODkxNCwiZXhwIjoxNTQ2MTI4OTE3fQ.0x19c5c0937443b56add4f7fb966e1d98851cbf76f0ebb2a5a5dcb1e04b37284e90b73143001d54ba2e27ac181bc16a66667e847c9442cb937d8a6c0db79abbeca01'

        var request = httpMocks.createRequest({
          header: {
            Authorization: `Bearer ${headerMissingISS}`,
          },
        })

        const spy = jest.spyOn(response, 'sendStatus')
        tokenMiddleware(request, response)
        expect(spy).toHaveBeenCalledWith(401)
      })       
    })

    describe('when the payload does not contain the iat claim', () => {
      test('returns a status 401 to the caller ', () => {
        var headerMissingIAT = 'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJsb2NrIjp7ImFkZHJlc3MiOiJqcWE1eGx1aCIsIm5hbWUiOiJOZXcgTG9jayIsImV4cGlyYXRpb25EdXJhdGlvbiI6MjU5MjAwMCwia2V5UHJpY2UiOiIxMDAwMDAwMDAwMDAwMDAwMCIsIm1heE51bWJlck9mS2V5cyI6MTAsIm93bmVyIjoiMHhBYUFkRUVENGMwQjg2MWNCMzZmNGNFMDA2YTlDOTBCQTJFNDNmZGMyIn0sImV4cCI6MTU0NjEzMDA4OX0.0xf233e2b973503d5e92197e9de035ade7d7abf9457b33924768166d55a983b8945dc1dd5cffcb1a6ac1cca6e1268abe4a4f2d0fe2a5738e77953f92557bd4766d00'

        var request = httpMocks.createRequest({
          header: {
            Authorization: `Bearer ${headerMissingIAT}`,
          },
        })

        const spy = jest.spyOn(response, 'sendStatus')
        tokenMiddleware(request, response)
        expect(spy).toHaveBeenCalledWith(401)
      })       
    })

    describe('when the payload does not contain the exp claim', () => {
      test('returns a status 401 to the caller ', () => {
        var headerMissingExpiry = 'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJsb2NrIjp7ImFkZHJlc3MiOiJqcWE1bnR6byIsIm5hbWUiOiJicmFoIiwiZXhwaXJhdGlvbkR1cmF0aW9uIjoyNTkyMDAwLCJrZXlQcmljZSI6IjEwMDAwMDAwMDAwMDAwMDAwIiwibWF4TnVtYmVyT2ZLZXlzIjoxMCwib3duZXIiOiIweEFhQWRFRUQ0YzBCODYxY0IzNmY0Y0UwMDZhOUM5MEJBMkU0M2ZkYzIifSwiaWF0IjoxNTQ2MTI5NjMwLCJleHAiOjE1NDYxMjk2MzMsImlzcyI6IjB4NGRkMzNkMSJ9.0xbb3b26a72b36e5f31020e289a04ee904d7a7aa531aa035e0a046170bc1f6bf636e3336a235b7eee7bd085f2578403d2c18be912e38bd2362513550d752db61be00'

        var request = httpMocks.createRequest({
          header: {
            Authorization: `Bearer ${headerMissingExpiry}`,
          },
        })

        const spy = jest.spyOn(response, 'sendStatus')
        tokenMiddleware(request, response)
        expect(spy).toHaveBeenCalledWith(401)
      })      
    })

    describe('when the payload contains an iss claim but it isnt the signee', () => {
      test('returns a status 401 to the caller ', () => {
        var headerNonsigneeIssuer = 'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJsb2NrIjp7ImFkZHJlc3MiOiJqcWE1a2Q5eSIsIm5hbWUiOiJOZXcgTG9jayIsImV4cGlyYXRpb25EdXJhdGlvbiI6MjU5MjAwMCwia2V5UHJpY2UiOiIxMDAwMDAwMDAwMDAwMDAwMCIsIm1heE51bWJlck9mS2V5cyI6MTAsIm93bmVyIjoiMHhBYUFkRUVENGMwQjg2MWNCMzZmNGNFMDA2YTlDOTBCQTJFNDNmZGMyIn0sImlhdCI6MTU0NjEyOTQ2OCwiZXhwIjoxNTQ2MTI5NDcxLCJpc3MiOiIweDRkZDMzZDEifQ.0x4ae0a4675b1980cfe169f974ef8e33e321db0a6f94e71862d8c861f69bc5f6125e99f30cc09ca51efd450eccdd74ebadba02d81ddb4ec922f732876944fe4bf901'

        var request = httpMocks.createRequest({
          header: {
            Authorization: `Bearer ${headerNonsigneeIssuer}`,
          },
        })

        const spy = jest.spyOn(response, 'sendStatus')
        tokenMiddleware(request, response)
        expect(spy).toHaveBeenCalledWith(401)
      })
    })

    describe('when the expiry window is larger than expected', () => {
      test('returns a status 401 to the caller ', () => {
        var headerWithLargeExpiryWindow = 'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJsb2NrIjp7ImFkZHJlc3MiOiJqcWE1YmR3bSIsIm5hbWUiOiJOZXcgTG9ja3NkZiIsImV4cGlyYXRpb25EdXJhdGlvbiI6MjU5MjAwMCwia2V5UHJpY2UiOiIxMDAwMDAwMDAwMDAwMDAwMCIsIm1heE51bWJlck9mS2V5cyI6MTAsIm93bmVyIjoiMHhBYUFkRUVENGMwQjg2MWNCMzZmNGNFMDA2YTlDOTBCQTJFNDNmZGMyIn0sImlhdCI6MTU0NjEyOTA0OSwiZXhwIjoxNTQ2MTI5MTM3LCJpc3MiOiIweEFhQWRFRUQ0YzBCODYxY0IzNmY0Y0UwMDZhOUM5MEJBMkU0M2ZkYzIifQ.0x1c8f1620ca9f12d53521933c502c177f9137e90d030e17af72c7945c1bdcb80c159e6b07404af76efa9b5bf7169cb72e2f8c5c977b0a2fbdb8c28a38e5ca264400'

        var request = httpMocks.createRequest({
          header: {
            Authorization: `Bearer ${headerWithLargeExpiryWindow}`,
          },
        })

        const spy = jest.spyOn(response, 'sendStatus')
        tokenMiddleware(request, response)
        expect(spy).toHaveBeenCalledWith(401)
      })

    })
  })
})
