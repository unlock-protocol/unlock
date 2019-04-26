import request from 'supertest'

const app = require('../../src/app')

describe('Metadata Controller', () => {
  describe('the data stub', () => {
    it('returns wellformed stub data', async () => {
      expect.assertions(2)

      let response = await request(app)
        .get('/api/key/anykey_for_now')
        .set('Accept', /json/)

      expect(response.statusCode).toBe(200)

      expect(response.body).toEqual(
        expect.objectContaining({
          description: expect.any(String),
          image: expect.any(String),
          name: expect.any(String),
        })
      )
    })
  })
})
