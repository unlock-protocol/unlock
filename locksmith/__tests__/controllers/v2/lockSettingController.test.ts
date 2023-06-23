import request from 'supertest'
import { loginRandomUser } from '../../test-helpers/utils'
import app from '../../app'
import { expect, vi } from 'vitest'
import { DEFAULT_LOCK_SETTINGS } from '../../../src/controllers/v2/lockSettingController'

const network = 4
const lockAddress = '0x62ccb13a72e6f991de53b9b7ac42885151588cd2'
const lockAddress2 = '0x060D07E7cCcD390B6F93B4D318E9FF203250D9be'
const lockSettingMock = {
  lockAddress: '0xF3850C690BFF6c1E343D2449bBbbb00b0E934f7b',
  network,
  sendEmail: true,
  unlockFeeChargedToUser: true,
  creditCardPrice: 0.04,
  emailSender: 'Custom Sender',
  slug: 'slug-test',
  replyTo: 'example@gmail.com',
  checkoutConfigId: 'f549d936-24e6-49e0-9acb',
  hookGuildId: '135999',
  createdAt: '2023-03-24T15:40:54.509Z',
  updatedAt: '2023-03-24T15:40:54.509Z',
}

vi.mock('../../../src/operations/lockSettingsOperations', () => {
  return {
    getSettings: () => {
      return lockSettingMock
    },
    setSendMail: ({ sendEmail, replyTo }) => {
      return {
        ...lockSettingMock,
        sendEmail,
        replyTo,
      }
    },
  }
})

vi.mock('@unlock-protocol/unlock-js', () => {
  return {
    Web3Service: vi.fn().mockImplementation(() => {
      return {
        isLockManager: (lock: string) => {
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
  it('should fail to save settings when authenticated and not lockManager', async () => {
    expect.assertions(2)

    const { loginResponse, address } = await loginRandomUser(app)
    expect(loginResponse.status).toBe(200)

    const saveSettingResponse = await request(app)
      .post(`/v2/lock-settings/${network}/locks/${address}`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
      .send({
        sendEmail: true,
      })

    expect(saveSettingResponse.status).toBe(403)
  })

  it('should correctly enable "sendEmail" setting when user is lockManager', async () => {
    expect.assertions(4)

    const { loginResponse } = await loginRandomUser(app)
    expect(loginResponse.status).toBe(200)

    const saveSettingResponse = await request(app)
      .post(`/v2/lock-settings/${network}/locks/${lockAddress}`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
      .send({
        sendEmail: true,
        unlockFeeChargedToUser: false,
      })

    const response = saveSettingResponse.body
    expect(saveSettingResponse.status).toBe(200)
    expect(response.sendEmail).toBe(true)
    expect(response.unlockFeeChargedToUser).toBe(false)
  })

  it('should correctly save settings when user is lockManager', async () => {
    expect.assertions(9)

    const { loginResponse } = await loginRandomUser(app)
    const saveSettingResponse = await request(app)
      .post(`/v2/lock-settings/${network}/locks/${lockAddress}`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
      .send({
        sendEmail: false,
        unlockFeeChargedToUser: false,
        replyTo: 'example@gmail.com',
        slug: 'slug-demo',
        emailSender: 'Example',
        checkoutConfigId: 'f549d936-24e6-49e0-9acb',
        hookGuildId: '14',
      })

    const response = saveSettingResponse.body
    expect(saveSettingResponse.status).toBe(200)
    expect(response.sendEmail).toBe(false)
    expect(response.creditCardPrice).toBe(null)
    expect(response.replyTo).toBe('example@gmail.com')
    expect(response.slug).toBe('slug-demo')
    expect(response.emailSender).toBe('Example')
    expect(response.checkoutConfigId).toBe('f549d936-24e6-49e0-9acb')
    expect(response.hookGuildId).toBe(14)
    expect(response.unlockFeeChargedToUser).toBe(false)
  })

  it('should save and retrieve setting when user is lockManager', async () => {
    expect.assertions(19)

    const { loginResponse } = await loginRandomUser(app)

    // save settings
    const saveSettingResponse = await request(app)
      .post(`/v2/lock-settings/${network}/locks/${lockSettingMock.lockAddress}`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
      .send({
        sendEmail: false,
        unlockFeeChargedToUser: false,
        replyTo: 'example@gmail.com',
        creditCardPrice: 0.04,
        slug: 'slug-test-2',
        emailSender: 'Custom Sender',
        checkoutConfigId: 'f549d936-24e6-49e0-9acb',
        hookGuildId: '199',
      })

    const response = saveSettingResponse.body
    expect(saveSettingResponse.status).toBe(200)
    expect(response.sendEmail).toBe(false)
    expect(response.unlockFeeChargedToUser).toBe(false)
    expect(response.replyTo).toBe('example@gmail.com')
    expect(response.creditCardPrice).toBe(0.04)
    expect(response.slug).toBe('slug-test-2')
    expect(response.emailSender).toBe('Custom Sender')
    expect(response.checkoutConfigId).toBe('f549d936-24e6-49e0-9acb')
    expect(response.hookGuildId).toBe(199)

    // retrieve settings
    const getSettingResponse = await request(app)
      .get(`/v2/lock-settings/${network}/locks/${lockSettingMock.lockAddress}`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)

    expect(getSettingResponse.status).toBe(200)
    expect(getSettingResponse.body.sendEmail).toBe(false)
    expect(getSettingResponse.body.unlockFeeChargedToUser).toBe(false)
    expect(getSettingResponse.body.replyTo).toBe('example@gmail.com')
    expect(getSettingResponse.body.lockAddress).toBe(
      lockSettingMock.lockAddress
    )
    expect(getSettingResponse.body.creditCardPrice).toBe(0.04)
    expect(getSettingResponse.body.slug).toBe('slug-test-2')
    expect(getSettingResponse.body.emailSender).toBe('Custom Sender')
    expect(getSettingResponse.body.checkoutConfigId).toBe(
      'f549d936-24e6-49e0-9acb'
    )
    expect(getSettingResponse.body.hookGuildId).toBe(199)
  })

  it('should retrieve default settings for a lock', async () => {
    expect.assertions(9)

    const { loginResponse } = await loginRandomUser(app)

    const getSettingResponse = await request(app)
      .get(`/v2/lock-settings/${network}/locks/${lockAddress2}`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)

    expect(getSettingResponse.status).toBe(200)
    expect(getSettingResponse.body.sendEmail).toBe(
      DEFAULT_LOCK_SETTINGS.sendEmail
    )
    expect(getSettingResponse.body.unlockFeeChargedToUser).toBe(true)
    expect(getSettingResponse.body.replyTo).toBe(undefined)
    expect(getSettingResponse.body.creditCardPrice).toBe(undefined)
    expect(getSettingResponse.body.slug).toBe(undefined)
    expect(getSettingResponse.body.emailSender).toBe(undefined)
    expect(getSettingResponse.body.checkoutConfigId).toBe(undefined)
    expect(getSettingResponse.body.hookGuildId).toBe(undefined)
  })

  it('should save null values for settings', async () => {
    expect.assertions(6)

    const { loginResponse } = await loginRandomUser(app)
    // save settings
    const saveSettingResponse = await request(app)
      .post(`/v2/lock-settings/${network}/locks/${lockSettingMock.lockAddress}`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
      .send({
        replyTo: null,
        creditCardPrice: null,
        emailSender: null,
        checkoutConfigId: null,
        hookGuildId: null,
      })

    const response = saveSettingResponse.body
    expect(saveSettingResponse.status).toBe(200)
    expect(response.replyTo).toBe(null)
    expect(response.creditCardPrice).toBe(null)
    expect(response.emailSender).toBe(null)
    expect(response.checkoutConfigId).toBe(null)
    expect(response.hookGuildId).toBe(null)
  })
})
