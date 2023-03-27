import request from 'supertest'
import { loginRandomUser } from '../../test-helpers/utils'
import app from '../../app'
import { expect, vi } from 'vitest'

const network = 4
const lockAddress = '0x62ccb13a72e6f991de53b9b7ac42885151588cd2'
const wrongWallet = '0xdCc44A9502239657578cB626C5afe9c2615733c0'
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
            lock.toLocaleLowerCase() ===
              lockSettingMock.lockAddress?.toLocaleLowerCase()
          )
        },
      }
    }),
  }
})

describe('LockSettings v2 endpoints for lock', () => {
  it('should throw an error when non-authorized user try to save setting', async () => {
    expect.assertions(2)
    const { loginResponse, address } = await loginRandomUser(app)
    expect(loginResponse.status).toBe(200)

    const response = await request(app).get(
      `/v2/settings/${network}/locks/${address}`
    )

    expect(response.status).toBe(404)
  })

  it('should fail to save setting with invalid params', async () => {
    expect.assertions(1)

    const { loginResponse } = await loginRandomUser(app)
    const saveSettingResponse = await request(app)
      .post(`/v2/settings/${network}/locks/${lockAddress}`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)

    expect(saveSettingResponse.status).toBe(500)
  })

  it('should correctly enable "sendEmail"  setting when user is lockManager', async () => {
    expect.assertions(2)

    const { loginResponse } = await loginRandomUser(app)
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

  it('should correctly disable "sendEmail"  setting when user is lockManager', async () => {
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
    const getSettingResponse = await request(app).get(
      `/v2/settings/${network}/locks/${lockSettingMock.lockAddress}`
    )

    expect(getSettingResponse.status).toBe(200)
    expect(getSettingResponse.body.sendEmail).toBe(false)
    expect(getSettingResponse.body.lockAddress).toBe(
      lockSettingMock.lockAddress
    )
  })

  it('should fail to retrieve non existing setting', async () => {
    expect.assertions(1)
    // retrieve settings
    const getSettingResponse = await request(app).get(
      `/v2/settings/${network}/locks/${wrongWallet}`
    )
    expect(getSettingResponse.status).toBe(404)
  })
})
