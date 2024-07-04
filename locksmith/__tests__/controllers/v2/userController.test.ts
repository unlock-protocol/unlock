import { vi, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import app from '../../app'
import { IssueUserTokenOptions } from '@coinbase/waas-server-auth'
import { UserAccountType } from '../../../src/controllers/userController'
import { UserAccount } from '../../../src/models/userAccount'

const nextAuthToken = 'token'
const coinbaseAuthToken = 'coinbase'
const emailAddress = 'test@test.com'
const selectedProvider = 'GOOGLE_ACCOUNT'

vi.mock('../../../src/utils/verifyNextAuthToken', () => {
  return {
    verifyToken: vi
      .fn()
      .mockImplementation(
        (selectedProvider: UserAccountType, email: string, token: string) => {
          return nextAuthToken === token
        }
      ),
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
  afterEach(async () => {
    await UserAccount.destroy({ where: { emailAddress: emailAddress } })
  })

  it('returns UUID from Coinbase Waas', async () => {
    expect.assertions(2)
    const retrieveWaasUuidRes = await request(app)
      .post(`/v2/api/users/${emailAddress}/${selectedProvider}/waas`)
      .send({ token: nextAuthToken })

    expect(retrieveWaasUuidRes.status).toBe(200)
    expect(retrieveWaasUuidRes.body).toEqual({ token: coinbaseAuthToken })
  })

  it('returns error if nextAuthToken is invalid', async () => {
    expect.assertions(1)
    const retrieveWaasUuidRes = await request(app)
      .post(`/v2/api/users/${emailAddress}/${selectedProvider}/waas`)
      .send({ token: 'gsa' })

    expect(retrieveWaasUuidRes.status).toBe(401)
  })

  it('returns error if no token is provided', async () => {
    expect.assertions(1)
    const retrieveWaasUuidRes = await request(app)
      .post(`/v2/api/users/${emailAddress}/${selectedProvider}/waas`)
      .send({ token: '' })

    expect(retrieveWaasUuidRes.status).toBe(401)
  })

  it('should not create and login user with UnlockAccount', async () => {
    expect.assertions(1)
    const retrieveWaasUuidRes = await request(app)
      .post(
        `/v2/api/users/${emailAddress}/${UserAccountType.UnlockAccount}/waas`
      )
      .send({ token: nextAuthToken })

    expect(retrieveWaasUuidRes.status).toBe(500)
  })
})
