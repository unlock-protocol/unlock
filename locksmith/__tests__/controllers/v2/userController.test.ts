import { vi, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import app from '../../app'
import { IssueUserTokenOptions } from '@coinbase/waas-server-auth'
import { UserAccountType } from '../../../src/controllers/userController'
import { UserAccount } from '../../../src/models/userAccount'
import VerificationCodes from '../../../src/models/verificationCodes'
import createFetchMock from 'vitest-fetch-mock'

const fetchMock = createFetchMock(vi)
fetchMock.enableMocks()

const nextAuthToken = 'token'
const token = crypto.randomUUID()
const coinbaseAuthToken = 'coinbase'
const emailAddress = 'test@test.com'
const emailAddress2 = 'test2@test.com'
const selectedProvider = 'GOOGLE_ACCOUNT'
const emailCode = '123456'

vi.mock('../../../src/utils/verifyNextAuthToken', () => {
  return {
    verifyNextAuthToken: vi
      .fn()
      .mockImplementation(
        (selectedProvider: UserAccountType, email: string, token: string) => {
          return true
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

vi.mock('../../../src/operations/wedlocksOperations', () => {
  return {
    sendEmail: vi.fn().mockImplementation(() => {
      return true
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

describe('Email verification code', async () => {
  beforeAll(async () => {
    await VerificationCodes.create({
      emailAddress: emailAddress,
      code: emailCode,
      codeExpiration: new Date('2049-01-01'),
      token: token,
      tokenExpiration: new Date('2049-01-01'),
    })
  })

  afterAll(async () => {
    await VerificationCodes.destroy({ where: { emailAddress: emailAddress } })
    await VerificationCodes.destroy({
      where: { emailAddress: emailAddress2 },
    })
  })

  it('should send email verification code', async () => {
    expect.assertions(1)
    const res = await request(app).get(
      `/v2/api/users/${emailAddress2}/send-verification-code`
    )

    expect(res.status).toBe(200)
  })

  it('should return 200 if email code is valid', async () => {
    expect.assertions(1)
    const res = await request(app)
      .post(`/v2/api/users/${emailAddress}/verify-email-code`)
      .send({ code: emailCode })

    expect(res.status).toBe(200)
  })

  it('should return 400 if email code is invalid', async () => {
    expect.assertions(1)
    const res = await request(app)
      .post(`/v2/api/users/${emailAddress}/verify-email-code`)
      .send({ code: '654321' })

    expect(res.status).toBe(400)
  })

  it('should return 400 if email code has been used', async () => {
    expect.assertions(1)
    const res = await request(app)
      .post(`/v2/api/users/${emailAddress}/verify-email-code`)
      .send({ code: emailCode })

    expect(res.status).toBe(400)
  })

  it('should change used email code', async () => {
    expect.assertions(2)
    const res = await request(app).get(
      `/v2/api/users/some@test.email/send-verification-code`
    )

    expect(res.status).toBe(200)

    const codeRes = await request(app)
      .post(`/v2/api/users/${emailAddress}/verify-email-code`)
      .send({ code: emailCode })

    expect(codeRes.status).toBe(400)
  })
})
