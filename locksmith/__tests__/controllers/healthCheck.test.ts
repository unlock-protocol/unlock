const request = require('supertest')
const app = require('../../src/app')

describe('Health Check Endpoint', () => {
  it('returns OK', async () => {
    expect.assertions(1)

    let response = await request(app).get('/health')
    expect(response.statusCode).toBe(200)
  })
})
