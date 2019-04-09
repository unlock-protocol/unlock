const request = require('supertest')
const app = require('../../src/app')

describe('Purchase Controller', () => {
  describe('purchase initiation', () => {
    it('responds with a 202', async () => {
      expect.assertions(1)
      let response = await request(app).post('/purchase')
      expect(response.statusCode).toBe(202)
    })
  })
})
