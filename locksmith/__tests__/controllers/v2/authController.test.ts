import request from 'supertest'
import { getWalletInput } from '../../test-helpers/utils'
import app from '../../app'
import { afterAll, beforeAll, expect, vi } from 'vitest'
import config from '../../../src/config/config'
import { privy } from '../../../src/utils/privyClient'
import { Session } from '../../../src/models'
import { logger } from '../../../src/logger'

vi.mock('../../../src/utils/privyClient', () => ({
  privy: {
    verifyAuthToken: vi.fn(),
    getUserByWalletAddress: vi.fn(),
  },
}))

beforeAll(() => {
  vi.useFakeTimers()
})

afterAll(() => {
  vi.clearAllTimers()
})

describe('Auth login endpoints for locksmith', () => {
  it('Login with Privy returns tokens and walletAddress', async () => {
    expect.assertions(3)

    const mockWalletAddress = '0x1234567890123456789012345678901234567890'
    const mockAccessToken = 'mock-access-token'
    const mockUserId = 'mock-user-id'

    // Mock Privy client responses
    if (privy) {
      vi.mocked(privy.verifyAuthToken).mockResolvedValue({
        userId: mockUserId,
        appId: 'mock-app-id',
        issuer: 'mock-issuer',
        issuedAt: Date.now(),
        expiration: Date.now() + 1000 * 60 * 60 * 24,
        sessionId: 'mock-session-id',
      })
      vi.mocked(privy.getUserByWalletAddress).mockResolvedValue({
        id: mockUserId,
        linkedAccounts: [
          {
            type: 'wallet',
            address: mockWalletAddress,
          },
        ],
      } as any)
    } else {
      throw new Error('Privy client is not initialized')
    }

    const loginResponse = await request(app).post('/v2/auth/privy').send({
      accessToken: mockAccessToken,
      walletAddress: mockWalletAddress,
    })

    expect(loginResponse.status).toBe(200)
    expect(loginResponse.body.walletAddress).toBe(
      mockWalletAddress.toLowerCase()
    )
    expect(loginResponse.body.accessToken).toBeTruthy()
  })

  it('Nonce are unique on each request', async () => {
    expect.assertions(3)
    const response = await request(app).get('/v2/auth/nonce')
    const response2 = await request(app).get('/v2/auth/nonce')
    expect(response.status).toBe(200)
    expect(response.text).not.toBeFalsy()
    expect(response.text).not.toBe(response2.text)
  })

  it('Login returns tokens and walletAddress using siwe signed message and signature', async () => {
    expect.assertions(2)
    const { walletAddress, message, signedMessage } = await getWalletInput()
    const loginResponse = await request(app).post('/v2/auth/login').send({
      signature: signedMessage,
      message: message.prepareMessage(),
    })
    expect(loginResponse.body.walletAddress).toBe(walletAddress)
    expect(loginResponse.status).toBe(200)
  })

  it('User endpoint returns user if provided valid token', async () => {
    expect.assertions(4)

    const { walletAddress, message, signedMessage } = await getWalletInput()
    const loginResponse = await request(app).post('/v2/auth/login').send({
      signature: signedMessage,
      message: message.prepareMessage(),
    })

    const userResponse = await request(app)
      .get('/v2/auth/user')
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)

    expect(userResponse.status).toBe(200)
    expect(userResponse.body.walletAddress).toBe(walletAddress)

    vi.setSystemTime(Date.now() + config.sessionDuration * 1000 + 1000)

    const userResponse2 = await request(app)
      .get('/v2/auth/user')
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)

    expect(userResponse2.status).toBe(401)

    const userResponse3 = await request(app).get('/v2/auth/user')

    expect(userResponse3.status).toBe(401)
  })

  it('Same nonce or message is rejected on login if already logged in once', async () => {
    expect.assertions(2)
    const { message, signedMessage } = await getWalletInput()
    const loginResponse = await request(app).post('/v2/auth/login').send({
      signature: signedMessage,
      message: message.prepareMessage(),
    })

    const loginResponse2 = await request(app).post('/v2/auth/login').send({
      signature: signedMessage,
      message: message.prepareMessage(),
    })

    expect(loginResponse.status).toBe(200)
    expect(loginResponse2.status).toBe(422)
  })
  it('Revoke refresh token', async () => {
    expect.assertions(3)
    const { message, signedMessage } = await getWalletInput()
    const loginResponse = await request(app).post('/v2/auth/login').send({
      signature: signedMessage,
      message: message.prepareMessage(),
    })

    const revokeResponse = await request(app)
      .post('/v2/auth/revoke')
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
      .send()

    const tokenResponse = await request(app)
      .get('/v2/auth/user')
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
      .send()

    expect(revokeResponse.status).toBe(200)
    expect(revokeResponse.body.message).toBe('Successfully revoked')
    expect(tokenResponse.status).toBe(401)
  })
})

describe('Privy login hardening', () => {
  const walletAddress = '0xabCD567890123456789012345678901234567890'

  const mockPrivy = (tokenUserId: string, walletUserId: string) => {
    if (!privy) {
      throw new Error('Privy client is not initialized')
    }
    vi.mocked(privy.verifyAuthToken).mockResolvedValue({
      userId: tokenUserId,
      appId: 'mock-app-id',
      issuer: 'mock-issuer',
      issuedAt: Date.now(),
      expiration: Date.now() + 1000 * 60 * 60 * 24,
      sessionId: 'mock-session-id',
    })
    vi.mocked(privy.getUserByWalletAddress).mockResolvedValue({
      id: walletUserId,
      linkedAccounts: [{ type: 'wallet', address: walletAddress }],
    } as any)
  }

  it('rejects a wallet that does not belong to the token user without creating a session', async () => {
    expect.assertions(3)
    mockPrivy('user-from-token', 'user-owning-wallet')
    const before = await Session.count()

    const response = await request(app)
      .post('/v2/auth/privy')
      .send({ accessToken: 'token', walletAddress })

    expect(response.status).toBe(401)
    expect(response.body.accessToken).toBeUndefined()
    expect(await Session.count()).toBe(before)
  })

  it('returns 400 rather than 401 when the body was not parsed as JSON', async () => {
    expect.assertions(2)
    mockPrivy('user', 'user')

    const response = await request(app)
      .post('/v2/auth/privy')
      .set('content-type', 'text/plain')
      .send(JSON.stringify({ accessToken: 'token', walletAddress }))

    expect(response.status).toBe(400)
    expect(response.body.error).toBe('Access token is required')
  })

  it('logs request diagnostics when rejecting a login with 400', async () => {
    expect.assertions(2)
    const warn = vi.spyOn(logger, 'warn').mockImplementation(() => logger)

    const response = await request(app)
      .post('/v2/auth/privy')
      .set('origin', 'https://app.unlock-protocol.com')
      .send({ walletAddress })

    expect(response.status).toBe(400)
    expect(warn).toHaveBeenCalledWith(
      'Privy login rejected',
      expect.objectContaining({
        reason: 'Access token is required',
        origin: 'https://app.unlock-protocol.com',
        contentType: expect.stringContaining('application/json'),
        bodyKeys: ['walletAddress'],
      })
    )
    warn.mockRestore()
  })
})

describe('Authorization header handling', () => {
  it('treats an unsupported authorization scheme as unauthenticated and logs it', async () => {
    expect.assertions(3)
    const warn = vi.spyOn(logger, 'warn').mockImplementation(() => logger)

    const publicResponse = await request(app)
      .get('/v2/auth/nonce')
      .set('authorization', 'Basic abc')
    const protectedResponse = await request(app)
      .get('/v2/auth/user')
      .set('authorization', 'Basic abc')

    expect(publicResponse.status).toBe(200)
    expect(protectedResponse.status).toBe(401)
    expect(warn).toHaveBeenCalledWith(
      'Unsupported authorization scheme',
      expect.objectContaining({ scheme: 'basic' })
    )
    warn.mockRestore()
  })
})
