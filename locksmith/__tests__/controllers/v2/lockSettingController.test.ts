import request from 'supertest'
import { loginRandomUser } from '../../test-helpers/utils'
import app from '../../app'
import { expect, vi } from 'vitest'
import { DEFAULT_LOCK_SETTINGS } from '../../../src/controllers/v2/lockSettingController'

const network = 4
const lockAddress = '0x62ccb13a72e6f991de53b9b7ac42885151588cd2'
const lockAddress2 = '0x060D07E7cCcD390B6F93B4D318E9FF203250D9be'
const lockSettingMock = {
  id: 4,
  lockAddress: '0xF3850C690BFF6c1E343D2449bBbbb00b0E934f7b',
  network,
  sendEmail: true,
  createdAt: '2023-03-24T15:40:54.509Z',
  updatedAt: '2023-03-24T15:40:54.509Z',
}

vi.mock('../../../src/operations/lockSettingsOperations', () => {
  return {
    getSettings: () => {
      return lockSettingMock
    },
    setSendMail: ({ sendEmail }) => {
      return {
        ...lockSettingMock,
        sendEmail,
      }
    },
  }
})

vi.mock('@unlock-protocol/unlock-js', () => {
  return {
    Web3Service: vi.fn().mockImplementation(() => {
      return {
        isLockManager: (lock: string) => {
          console.log(lock)
          return (
            lockAddress.toLowerCase() === lock.toLowerCase() ||
            lockSettingMock.lockAddress?.toLowerCase() === lock.toLowerCase() ||
            lockAddress2.toLowerCase() === lock.toLowerCase()
          )
        },
      }
    }),
  }
})

describe('LockSettings v2 endpoints for lock', () => {
  it('should fail to get settings  with no authentication', async () => {
    expect.assertions(1)

    const response = await request(app).get(
      `/v2/settings/${network}/locks/${lockAddress}`
    )

    expect(response.status).toBe(401)
  })

  it('should fail to save settings with no authentication', async () => {
    expect.assertions(1)

    const saveSettingResponse = await request(app).post(
      `/v2/settings/${network}/locks/${lockAddress}`
    )

    expect(saveSettingResponse.status).toBe(401)
  })

  it('should fail to get settings when authenticated and not lockManager', async () => {
    expect.assertions(2)

    const { loginResponse, address } = await loginRandomUser(app)
    expect(loginResponse.status).toBe(200)

    const response = await request(app)
      .get(`/v2/settings/${network}/locks/${address}`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)

    expect(response.status).toBe(403)
  })

  it('should fail to save settings when authenticated and not lockManager', async () => {
    expect.assertions(2)

    const { loginResponse, address } = await loginRandomUser(app)
    expect(loginResponse.status).toBe(200)

    const saveSettingResponse = await request(app)
      .post(`/v2/settings/${network}/locks/${address}`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
      .send({
        sendEmail: true,
      })

    expect(saveSettingResponse.status).toBe(403)
  })

  it('should correctly enable "sendEmail" setting when user is lockManager', async () => {
    expect.assertions(3)

    const { loginResponse } = await loginRandomUser(app)
    expect(loginResponse.status).toBe(200)

    const saveSettingResponse = await request(app)
      .post(`/v2/settings/${network}/locks/${lockAddress}`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
      .send({
        sendEmail: true,
      })

    const response = saveSettingResponse.body
    expect(saveSettingResponse.status).toBe(200)
    expect(response.sendEmail).toBe(true)
  })

  it('should correctly disable "sendEmail" setting when user is lockManager', async () => {
    expect.assertions(2)

    const { loginResponse } = await loginRandomUser(app)
    const saveSettingResponse = await request(app)
      .post(`/v2/settings/${network}/locks/${lockAddress}`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
      .send({
        sendEmail: false,
      })

    const response = saveSettingResponse.body
    expect(saveSettingResponse.status).toBe(200)
    expect(response.sendEmail).toBe(false)
  })

  it('should save and retrieve setting when user is lockManager', async () => {
    expect.assertions(5)

    const { loginResponse } = await loginRandomUser(app)

    // save settings
    const saveSettingResponse = await request(app)
      .post(`/v2/settings/${network}/locks/${lockSettingMock.lockAddress}`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
      .send({
        sendEmail: false,
      })

    const response = saveSettingResponse.body
    expect(saveSettingResponse.status).toBe(200)
    expect(response.sendEmail).toBe(false)

    // retrieve settings
    const getSettingResponse = await request(app)
      .get(`/v2/settings/${network}/locks/${lockSettingMock.lockAddress}`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)

    expect(getSettingResponse.status).toBe(200)
    expect(getSettingResponse.body.sendEmail).toBe(false)
    expect(getSettingResponse.body.lockAddress).toBe(
      lockSettingMock.lockAddress
    )
  })

  it('should retrieve default settings for a lock', async () => {
    expect.assertions(2)

    const { loginResponse } = await loginRandomUser(app)

    const getSettingResponse = await request(app)
      .get(`/v2/settings/${network}/locks/${lockAddress2}`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)

    console.log(getSettingResponse.body)

    expect(getSettingResponse.status).toBe(200)
    expect(getSettingResponse.body.sendEmail).toBe(
      DEFAULT_LOCK_SETTINGS.sendEmail
    )
  })
})
