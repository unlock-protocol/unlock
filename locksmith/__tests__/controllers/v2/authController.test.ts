import request from 'supertest'
import { getWalletInput, sleep } from '../../test-helpers/utils'

const app = require('../../../src/app')

jest.setTimeout(10000)

describe('Auth login endpoints for locksmith', () => {
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

    await sleep(3600)

    const userResponse2 = await request(app)
      .get('/v2/auth/user')
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)

    expect(userResponse2.status).toBe(403)

    const userResponse3 = await request(app).get('/v2/auth/user')

    expect(userResponse3.status).toBe(403)
  })

  it('Refresh token can be used to get new access token', async () => {
    expect.assertions(2)
    const { message, signedMessage } = await getWalletInput()
    const loginResponse = await request(app).post('/v2/auth/login').send({
      signature: signedMessage,
      message: message.prepareMessage(),
    })

    // Wait a bit otherwise access token will be same due to expiration
    await sleep(2000)

    const tokenResponse = await request(app)
      .post('/v2/auth/token')
      .set('refresh-token', loginResponse.body.refreshToken)
      .send()
    expect(tokenResponse.status).toBe(200)
    expect(tokenResponse.body.accessToken).not.toBe(
      loginResponse.body.accessToken
    )
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
      .set('refresh-token', loginResponse.body.refreshToken)
      .send()

    const tokenResponse = await request(app)
      .post('/v2/auth/token')
      .set('refresh-token', loginResponse.body.refreshToken)
      .send()

    expect(revokeResponse.status).toBe(200)
    expect(revokeResponse.text).toBe('true')
    expect(tokenResponse.status).toBe(401)
  })
})
