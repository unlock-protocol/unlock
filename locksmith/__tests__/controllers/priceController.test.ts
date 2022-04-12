import request from 'supertest'

const app = require('../../src/app')

// eslint-disable-next-line
var mockWeb3Service = {
  getLock: jest.fn(() =>
    Promise.resolve({
      keyPrice: 100,
    })
  ),
  isKeyGranter: jest.fn(() => Promise.resolve(true)),
}

jest.mock('@unlock-protocol/unlock-js', () => ({
  Web3Service: function Web3Service() {
    return mockWeb3Service
  },
}))

describe('Price Controller', () => {
  describe.skip('fiatPrice', () => {
    it('return null price for usd if the lock has not been enabled for credit card purchases', async () => {
      expect.assertions(2)

      mockWeb3Service.isKeyGranter = jest.fn(() => Promise.resolve(false))

      const response = await request(app)
        .get('/price/fiat/0xf5D0C1cfE659902F9ABAE67A70d5923Ef8dbC1Dc')
        .set('Accept', 'json')

      expect(response.status).toBe(200)
      expect(response.body).toEqual({})
    })

    it('return a price in usd which includes all fees for a lock which has been approved', async () => {
      expect.assertions(2)

      mockWeb3Service.isKeyGranter = jest.fn(() => Promise.resolve(true))

      const lockAddress = '0xf5D0C1cfE659902F9ABAE67A70d5923Ef8dbC1Dc'

      const response = await request(app)
        .get(`/price/fiat/${lockAddress}`)
        .set('Accept', 'json')

      expect(response.status).toBe(200)
      // "keyPrice": 100,
      // "gasFee": 0,
      // "creditCardProcessing": 35,
      // "unlockServiceFee": 100
      expect(response.body.usd).toBeGreaterThan(154)
    })
  })
})
