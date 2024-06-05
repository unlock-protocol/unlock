import { vi, expect } from 'vitest'
import request from 'supertest'
import app from '../../app'
import { IssueUserTokenOptions } from '@coinbase/waas-server-auth'

const googleAuthToken = 'token'
const coinbaseAuthToken = 'coinbase'
const emailAddress = 'test@test.com'
const selectedProvider = 'GOOGLE_ACCOUNT'

vi.mock('../../../src/utils/verifyGoogleToken', () => {
  return {
    verifyToken: vi.fn().mockImplementation((email: string, token: string) => {
      return googleAuthToken === token
    }),
  }
})

vi.mock('@coinbase/waas-server-auth', () => {
  return {
    issueUserToken: vi
      .fn()
      .mockImplementation((options: IssueUserTokenOptions): Promise<string> => {
        return Promise.resolve(coinbaseAuthToken)
      }),
  }
})

describe('Get UUID from Coinbase WAAS', () => {
  it('returns UUID from Coinbase Waas', async () => {
    expect.assertions(2)
    const retrieveWaasUuidRes = await request(app)
      .post(`/users/${emailAddress}/${selectedProvider}/waas`)
      .send({ token: googleAuthToken })

    expect(retrieveWaasUuidRes.status).toBe(200)
    expect(retrieveWaasUuidRes.body).toEqual({ token: coinbaseAuthToken })
  })

  it('returns error if googleAuthToken is invalid', async () => {
    expect.assertions(2)
    const retrieveWaasUuidRes = await request(app)
      .post(`/users/${emailAddress}/${selectedProvider}/waas`)
      .send({ token: 'gsa' })

    expect(retrieveWaasUuidRes.status).toBe(200)
    expect(retrieveWaasUuidRes.body).toEqual({ token: coinbaseAuthToken })
  })
})
