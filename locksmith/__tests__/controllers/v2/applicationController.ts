import request from 'supertest'
import { getWalletInput } from '../../test-helpers/utils'

const app = require('../../../src/app')

jest.setTimeout(10000)

// eslint-disable-next-line
var application: any

const APP_NAME = 'BANANA'
const APP_DESC = 'BANANA APP'

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
        description: APP_DESC,
      })

    application = applicationResponse.body
  })

  it('application has specified title and description', () => {
    expect.assertions(2)
    expect(application.name).toBe(APP_NAME)
    expect(application.description).toBe(APP_DESC)
  })

  it('application can access its user data', async () => {
    expect.assertions(2)

    const applicationData = await request(app)
      .get('/v2/auth/user')
      .set('Authorization', `Basic ${application.apiKey}`)

    expect(applicationData.body.clientId).toBe(application.id)
    expect(applicationData.body.type).toBe('application')
  })

  it('application cannot access user data without authentication', async () => {
    expect.assertions(1)
    const applicationData = await request(app)
      .get('/v2/auth/user')
      .set('Authorization', `Basic 24${application.apiKey}`)

    expect(applicationData.statusCode).toBe(403)
  })
})
