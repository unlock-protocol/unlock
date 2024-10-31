import request from 'supertest'
import app from '../app'
import { expect } from 'vitest'
import createFetchMock from 'vitest-fetch-mock'
import { vi } from 'vitest'

const fetchMock = createFetchMock(vi)
fetchMock.enableMocks()

describe('Health Check Endpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fetchMock.resetMocks()
  })

  it('returns OK', async () => {
    expect.assertions(1)

    const response = await request(app).get('/health')
    expect(response.status).toBe(200)
  })
})
