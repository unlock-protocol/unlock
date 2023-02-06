import request from 'supertest'
import { loginRandomUser } from '../../test-helpers/utils'
import app from '../../app'
import { vi } from 'vitest'

let lockAddress = '0x62ccb13a72e6f991de53b9b7ac42885151588cd2'
const template = 'keyMinded'

const network = 5
const customEmailContent = `Custom Email Content`

vi.mock('@unlock-protocol/unlock-js', () => {
  return {
    Web3Service: vi.fn().mockImplementation(() => {
      return {
        isLockManager: (lock: string, manager: string) => {
          return lockAddress.toLowerCase() === lock.toLowerCase()
        },
      }
    }),
  }
})

describe('Email Controller v2', () => {
  it('Save custom email throws an error when is not authenticated', async () => {
    expect.assertions(2)
    const { loginResponse } = await loginRandomUser(app)
    expect(loginResponse.status).toBe(200)

    const response = await request(app).post(
      `/v2/email/${network}/locks/${lockAddress}/custom/${template}`
    )

    expect(response.status).toBe(401)
  })

  it('Get custom email throws an error when is not authenticated', async () => {
    expect.assertions(2)
    const { loginResponse } = await loginRandomUser(app)
    expect(loginResponse.status).toBe(200)

    const response = await request(app).get(
      `/v2/email/${network}/locks/${lockAddress}/custom/${template}`
    )

    expect(response.status).toBe(401)
  })

  it('Correctly save email custom content when user is lock manager', async () => {
    expect.assertions(3)
    const { loginResponse } = await loginRandomUser(app)
    expect(loginResponse.status).toBe(200)

    const response = await request(app)
      .post(`/v2/email/${network}/locks/${lockAddress}/custom/${template}`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
      .send({
        content: customEmailContent,
      })

    expect(response.status).toBe(200)
    expect(response.body.content).toContain('Custom Email Content')
  })

  it('Get saved details from not lock manager fails', async () => {
    expect.assertions(2)
    const { loginResponse, address } = await loginRandomUser(app)
    expect(loginResponse.status).toBe(200)

    // save custom email content
    await request(app)
      .post(`/v2/email/${network}/locks/${lockAddress}/custom/${template}`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
      .send({
        content: customEmailContent,
      })

    // get for non-lock manager should fail
    lockAddress = address
    const response = await request(app)
      .get(`/v2/email/${network}/locks/${lockAddress}/custom/${template}`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)

    expect(response.status).toBe(404)
  })

  it('Correctly save and get custom email content saved for lock manager', async () => {
    expect.assertions(3)
    const { loginResponse } = await loginRandomUser(app)
    expect(loginResponse.status).toBe(200)

    // save custom content for a specific template
    await request(app)
      .post(`/v2/email/${network}/locks/${lockAddress}/custom/${template}`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
      .send({
        content: customEmailContent,
      })

    // check if the custom content saved is present
    const response = await request(app)
      .get(`/v2/email/${network}/locks/${lockAddress}/custom/${template}`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)

    expect(response.status).toBe(200)
    expect(response.body.content).toContain('Custom Email Content')
  })
})
