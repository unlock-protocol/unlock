import request from 'supertest'
import { getWalletInput } from '../../test-helpers/utils'
import app from '../../app'

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
    expect.assertions(1)
    const applicationData = await request(app)
      .get('/v2/auth/user')
      .set('Authorization', `Api-key ${application.key}`)
    expect(applicationData.body.walletAddress).toBe(application.walletAddress)
  })

  it('application cannot access user data without authentication', async () => {
    expect.assertions(1)
    const applicationData = await request(app)
      .get('/v2/auth/user')
      .set('Authorization', `Api-key 24${application.key}`)

    expect(applicationData.statusCode).toBe(401)
  })

  describe('list applications', () => {
    it('list applications with auth', async () => {
      expect.assertions(2)
      const applicationList = await request(app)
        .get('/v2/applications/list')
        .set('Authorization', `Bearer ${user.accessToken}`)
        .send()

      expect(applicationList.statusCode).toBe(200)
      expect(applicationList.body.result).toBeInstanceOf(Array)
    })

    it('list applications without auth', async () => {
      expect.assertions(1)
      const applicationList = await request(app)
        .get('/v2/applications/list')
        .send()

      expect(applicationList.statusCode).toBe(401)
    })

    it('list application with API KEY', async () => {
      expect.assertions(1)
      const applicationList = await request(app)
        .get('/v2/applications/list')
        .set('Authorization', `Api-key ${application.key}`)
        .send()

      expect(applicationList.statusCode).toBe(403)
    })
  })

  describe('Update application', () => {
    it('update application with invalid body', async () => {
      expect.assertions(2)

      const updatedApplication = await request(app)
        .put(`/v2/applications/${application.id}`)
        .send({
          title: NEW_APP_NAME,
        })
        .set('Authorization', `Bearer ${user.accessToken}`)

      expect(updatedApplication.statusCode).toBe(400)
      expect(updatedApplication.body.error).not.toBe(undefined)
    })

    it('update application successfully', async () => {
      expect.assertions(2)
      const updatedApplication = await request(app)
        .put(`/v2/applications/${application.id}`)
        .send({
          name: NEW_APP_NAME,
        })
        .set('Authorization', `Bearer ${user.accessToken}`)

      expect(updatedApplication.statusCode).toBe(200)
      expect(updatedApplication.body.name).toBe(NEW_APP_NAME)
    })
  })

  describe('Delete application', () => {
    it('delete non-existent app', async () => {
      expect.assertions(1)
      const deletedApplication = await request(app)
        .delete('/v2/applications/235092335829')
        .set('Authorization', `Bearer ${user.accessToken}`)
        .send()

      expect(deletedApplication.statusCode).toBe(404)
    })

    it('delete existing app', async () => {
      expect.assertions(2)
      const deletedApplication = await request(app)
        .delete(`/v2/applications/${application.id}`)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .send()

      const userResponse = await request(app)
        .get('/v2/auth/user')
        .set('Authorization', `Api-key ${application.key}`)
        .send()

      expect(deletedApplication.statusCode).toBe(200)
      expect(userResponse.statusCode).toBe(401)
    })
  })
})
