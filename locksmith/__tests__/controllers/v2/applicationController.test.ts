import request from 'supertest'
import { getWalletInput } from '../../test-helpers/utils'

const app = require('../../../src/app')

jest.setTimeout(10000)

// eslint-disable-next-line
var application: any
// eslint-disable-next-line
var user: any

const APP_NAME = 'BANANA'
const NEW_APP_NAME = 'UPDATED'

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

    user = loginResponse.body
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

  it('list applications', async () => {
    expect.assertions(2)
    const refreshResponse = await request(app).post('/v2/auth/token').send({
      refreshToken: user.refreshToken,
    })

    user = refreshResponse.body

    const applicationList = await request(app)
      .get('/v2/applications/list')
      .set('Authorization', `Bearer ${user.accessToken}`)
      .send()

    expect(applicationList.statusCode).toBe(200)
    expect(applicationList.body.result).toBeInstanceOf(Array)
  })

  it('Update application', async () => {
    expect.assertions(1)
    const refreshResponse = await request(app).post('/v2/auth/token').send({
      refreshToken: user.refreshToken,
    })

    user = refreshResponse.body
    const updatedApplication = await request(app)
      .put(`/v2/applications/${application.id}`)
      .send({
        name: NEW_APP_NAME,
      })
      .set('Authorization', `Bearer ${user.accessToken}`)

    expect(updatedApplication.body.name).toBe(NEW_APP_NAME)
  })

  it('Delete application', async () => {
    expect.assertions(2)
    const refreshResponse = await request(app).post('/v2/auth/token').send({
      refreshToken: user.refreshToken,
    })
    user = refreshResponse.body
    const deletedApplication = await request(app)
      .delete(`/v2/applications/${application.id}`)
      .set('Authorization', `Bearer ${user.accessToken}`)
      .send()

    expect(deletedApplication.statusCode).toBe(200)

    const userResponse = await request(app)
      .get('/v2/auth/user')
      .set('Authorization', `Api-key ${application.key}`)
      .send()

    expect(userResponse.statusCode).toBe(403)
  })
})
