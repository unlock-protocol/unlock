import request from 'supertest'
import { getWalletInput, loginRandomUser } from '../../test-helpers/utils'
import app from '../../app'
import { expect } from 'vitest'
import { UserReference } from '../../../src/models'

describe('update user', () => {
  beforeEach(async () => {
    await UserReference.truncate()
  })

  it.skip('save a user email address if supplied', async () => {
    expect.assertions(4)
    const { message, signedMessage } = await getWalletInput()
    const loginResponse = await request(app).post('/v2/auth/login').send({
      signature: signedMessage,
      message: message.prepareMessage(),
    })

    expect(loginResponse.status).toBe(200)
    const emailAddress = 'julien@unlock-protocol.com'

    const response = await request(app)
      .put(`/v2/user`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
      .send({ emailAddress })

    expect(response.body.emailAddress).to.equal(emailAddress)

    const userResponse = await request(app)
      .get('/v2/auth/user')
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
    expect(userResponse.body.emailAddress).to.equal(emailAddress)
    expect(userResponse.body.walletAddress).to.equal(
      loginResponse.body.walletAddress
    )
  })

  it('refuses to save and invalid user email', async () => {
    expect.assertions(2)
    const { message, signedMessage } = await getWalletInput()
    const loginResponse = await request(app).post('/v2/auth/login').send({
      signature: signedMessage,
      message: message.prepareMessage(),
    })

    expect(loginResponse.status).toBe(200)
    const response = await request(app)
      .put(`/v2/user`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
      .send({ emailAddress: 'invalid' })
    expect(response.status).to.equal(400)
  })

  it('refuse to save an  email address if the user is not logged in', async () => {
    expect.assertions(1)
    const emailAddress = 'julien@unlock-protocol.com'
    const response = await request(app).put(`/v2/user`).send({ emailAddress })
    expect(response.status).to.equal(401)
  })
})
