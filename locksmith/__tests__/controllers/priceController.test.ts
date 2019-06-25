import request from 'supertest'

const nock = require('nock')
const app = require('../../src/app')

nock.back.fixtures = __dirname + '/fixtures/priceController'
nock.disableNetConnect()

afterAll(() => {
  nock.restore()
})

describe('Price Controller', () => {
  describe('price', () => {
    it('return the price from our stub', async () => {
      expect.assertions(2)
      let { nockDone } = await nock.back('fetch_price.json')
      let response = await request(app)
        .get('/price/0x5Cd3FC283c42B4d5083dbA4a6bE5ac58fC0f0267')
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
})
