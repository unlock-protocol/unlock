import request from 'supertest'

const app = require('../../src/app')

describe('Price Controller', () => {
  describe('price', () => {
    it('return the price from our stub', async () => {
      expect.assertions(2)
      let response = await request(app)
        .get('/price/0xab7c74abC0C4d48d1bdad5DCB26153FC8780f83E')
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
})
