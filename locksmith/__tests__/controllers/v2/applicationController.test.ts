import request from 'supertest'
import { getWalletInput } from '../../test-helpers/utils'

const app = require('../../../src/app')

jest.setTimeout(10000)

// eslint-disable-next-line
var application: any

const APP_NAME = 'BANANA'

describe('Application endpoint', () => {
  beforeAll(async () => {
    const { message, signedMessage } = await getWalletInput()
    const loginResponse = await request(app).post('/v2/auth/login').send({
      signature: signedMessage,
      message: message.prepareMessage(),
    })

    const applicationResponse = await request(app)
      .post('/v2/applications')
      .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
      .send({
        name: APP_NAME,
      })

    application = applicationResponse.body
  })

  it('application has specified name', () => {
    expect.assertions(1)
    expect(application.name).toBe(APP_NAME)
  })

  it('application can access its user data', async () => {
    expect.assertions(2)

    const applicationData = await request(app)
      .get('/v2/auth/user')
      .set('Authorization', `Api-key ${application.key}`)

    expect(applicationData.body.id).toBe(application.id)
    expect(applicationData.body.type).toBe('application')
  })

  it('application cannot access user data without authentication', async () => {
    expect.assertions(1)
    const applicationData = await request(app)
      .get('/v2/auth/user')
      .set('Authorization', `Api-key 24${application.key}`)

    expect(applicationData.statusCode).toBe(403)
  })
})
