import request from 'supertest'
import { vi, describe, expect } from 'vitest'
import app from '../../app'

describe('eventcaster endpoints', () => {
  it('returns an error when authentication is there but the user is not lock manager', async () => {
    const response = await request(app)
      .get(`/v2/eventcaster/`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)

    expect(response.status).toBe(403)
  })

  it('returns an error when authentication is there but the user is not the owner', async () => {
    expect.assertions(2)

    const { loginResponse } = await loginRandomUser(app)
    expect(loginResponse.status).toBe(200)

    const response = await request(app)
      .get(
        `/v2/certificate/${network}/lock/${wrongLockAddress}/key/${wrongTokenId}/generate`
      )
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)

    expect(response.status).toBe(403)
  })
})
