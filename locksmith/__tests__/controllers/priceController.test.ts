import path from 'path'
import request from 'supertest'

const nockBack = require('nock').back
const app = require('../../src/app')
const models = require('../../src/models')

const { AuthorizedLock } = models

const chain = 1984

describe('Price Controller', () => {
  beforeAll(async () => {
    nockBack.fixtures = path.join(__dirname, 'fixtures', 'priceController')
    nockBack.setMode('dryrun')
  })

  describe('price', () => {
    it('return the price from our stub', async () => {
      expect.assertions(2)
      const { nockDone } = await nockBack('fetch_price.json')

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
      nockDone()
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
      const { nockDone } = await nockBack('fetch_fiat_price_no_cc.json')

      const response = await request(app)
        .get('/price/fiat/0xf5D0C1cfE659902F9ABAE67A70d5923Ef8dbC1Dc')
        .set('Accept', 'json')

      expect(response.status).toBe(200)
      expect(response.body).toEqual({})
      nockDone()
    })

    it('return a price in usd which includes all fees for a lock which has been approved', async () => {
      expect.assertions(2)
      const { nockDone } = await nockBack('fetch_fiat_price_cc.json')

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
      nockDone()
    })
  })
})
