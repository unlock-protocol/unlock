import request from 'supertest'

const app = require('../../src/app')

describe('Health Check Endpoint', () => {
  it('returns OK', async () => {
    expect.assertions(1)

    const response = await request(app).get('/health')
    expect(response.status).toBe(200)
  })
})
