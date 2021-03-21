import request from 'supertest'

const app = require('../../src/app')
const models = require('../../src/models')

const { AuthorizedLock } = models

const chain = 1984

const mockWeb3Service = {
  getLock: jest.fn(() =>
    Promise.resolve({
      keyPrice: 100,
    })
  ),
}

jest.mock('@unlock-protocol/unlock-js', () => ({
  Web3Service: function Web3Service() {
    return mockWeb3Service
  },
}))

describe('Price Controller', () => {
  describe('price', () => {
    it('return the price from our stub', async () => {
      expect.assertions(2)

      const response = await request(app)
        .get('/price/0xf5D0C1cfE659902F9ABAE67A70d5923Ef8dbC1Dc')
        .set('Accept', 'json')

      expect(response.status).toBe(200)
      expect(response.body).toEqual(
        expect.objectContaining({
          keyPrice: expect.any(Number),
          gasFee: expect.any(Number),
          creditCardProcessing: expect.any(Number),
          unlockServiceFee: expect.any(Number),
        })
      )
    })
  })

  describe('fiatPrice', () => {
    beforeEach(async () => {
      // Make sure the lock has not been approved
      await AuthorizedLock.truncate()
    })
    afterAll(async () => {
      // Cleanup
      await AuthorizedLock.truncate()
    })

    it('return null price for usd if the lock has not been enabled for credit card purchases', async () => {
      expect.assertions(2)

      const response = await request(app)
        .get('/price/fiat/0xf5D0C1cfE659902F9ABAE67A70d5923Ef8dbC1Dc')
        .set('Accept', 'json')

      expect(response.status).toBe(200)
      expect(response.body).toEqual({})
    })

    it('return a price in usd which includes all fees for a lock which has been approved', async () => {
      expect.assertions(2)

      const lockAddress = '0xf5D0C1cfE659902F9ABAE67A70d5923Ef8dbC1Dc'

      // Approve the lock!
      await AuthorizedLock.create({
        chain,
        address: lockAddress,
      })

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
