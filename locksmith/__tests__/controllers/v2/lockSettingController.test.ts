import request from 'supertest'
import { loginRandomUser } from '../../test-helpers/utils'
import app from '../../app'
import { expect, vi, beforeAll } from 'vitest'
import { DEFAULT_LOCK_SETTINGS } from '../../../src/controllers/v2/lockSettingController'

const network = 4
const lockAddress = '0x62ccb13a72e6f991de53b9b7ac42885151588cd2'
const lockAddress2 = '0x060D07E7cCcD390B6F93B4D318E9FF203250D9be'

const lockSettingMock: any = {
  lockAddress: '0xF3850C690BFF6c1E343D2449bBbbb00b0E934f7b',
  network,
  sendEmail: true,
  creditCardPrice: 0.04,
  emailSender: 'Custom Sender',
  slug: 'slug-test',
  replyTo: 'example@gmail.com',
  checkoutConfigId: 'f549d936-24e6-49e0-9acb',
  createdAt: '2023-03-24T15:40:54.509Z',
  updatedAt: '2023-03-24T15:40:54.509Z',
}

const lockSettingNonManagerMock: any = {
  lockAddress: '0xF3850C690BFF6c1E343D2449bBbbb00b0E934f7b',
  network,
  sendEmail: true,
  creditCardPrice: 0.04,
  emailSender: 'Custom Sender',
  slug: 'slug-test',
  replyTo: 'example@gmail.com',
  checkoutConfigId: 'f549d936-24e6-49e0-9acb',
  createdAt: '2023-03-24T15:40:54.509Z',
  updatedAt: '2023-03-24T15:40:54.509Z',
}

// eslint-disable-next-line
var mockWeb3Service = {
  isLockManager: vi.fn(() => Promise.resolve(true)),
}

vi.mock('../../../src/operations/lockSettingsOperations', () => {
  return {
    getSettings: ({ lockAddress: lock }) => {
      const mockLockSettings = vi.fn().mockImplementation(() => {
        // mock isLockManager for this locks
        const isLockManager = [
          lockAddress,
          lockAddress2,
          lockSettingMock.lockAddress,
        ].includes(lock)

        if (isLockManager) {
          return Promise.resolve(lockSettingMock)
        }
        return Promise.resolve(lockSettingNonManagerMock)
      })

      return mockLockSettings
    },
    setSendMail: ({ sendEmail, replyTo }) => {
      const mockSetSendMail = {
        ...lockSettingMock,
        sendEmail,
        replyTo,
      }
      return mockSetSendMail
    },
  }
})

vi.mock('@unlock-protocol/unlock-js', () => ({
  Web3Service: function Web3Service() {
    return mockWeb3Service
  },
}))

beforeAll(() => {
  mockWeb3Service.isLockManager = vi.fn(() => Promise.resolve(false))
})

describe('LockSettings v2 endpoints for lock', () => {
  afterEach(async () => {
    mockWeb3Service.isLockManager = vi.fn(() => Promise.resolve(false))
  })

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
    expect.assertions(3)

    const { loginResponse } = await loginRandomUser(app)
    expect(loginResponse.status).toBe(200)

    mockWeb3Service.isLockManager = vi.fn(() => Promise.resolve(true))
    const saveSettingResponse = await request(app)
      .post(`/v2/lock-settings/${network}/locks/${lockAddress}`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
      .send({
        sendEmail: true,
      })

    const response = saveSettingResponse.body
    expect(saveSettingResponse.status).toBe(200)
    expect(response.sendEmail).toBe(true)
  })

  it('should correctly save settings when user is lockManager', async () => {
    expect.assertions(7)

    const { loginResponse } = await loginRandomUser(app)
    mockWeb3Service.isLockManager = vi.fn(() => Promise.resolve(true))
    const saveSettingResponse = await request(app)
      .post(`/v2/lock-settings/${network}/locks/${lockAddress}`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
      .send({
        sendEmail: false,
        replyTo: 'example@gmail.com',
        slug: 'slug-demo',
        emailSender: 'Example',
        checkoutConfigId: 'f549d936-24e6-49e0-9acb',
      })

    const response = saveSettingResponse.body
    expect(saveSettingResponse.status).toBe(200)
    expect(response.sendEmail).toBe(false)
    expect(response.creditCardPrice).toBe(null)
    expect(response.replyTo).toBe('example@gmail.com')
    expect(response.slug).toBe('slug-demo')
    expect(response.emailSender).toBe('Example')
    expect(response.checkoutConfigId).toBe('f549d936-24e6-49e0-9acb')
  })

  it('should save and retrieve setting when user is lockManager', async () => {
    expect.assertions(15)

    const { loginResponse } = await loginRandomUser(app)

    mockWeb3Service.isLockManager = vi.fn(() => Promise.resolve(true))
    // save settings
    const saveSettingResponse = await request(app)
      .post(`/v2/lock-settings/${network}/locks/${lockSettingMock.lockAddress}`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
      .send({
        sendEmail: false,
        replyTo: 'example@gmail.com',
        creditCardPrice: 0.04,
        slug: 'slug-test',
        emailSender: 'Custom Sender',
        checkoutConfigId: 'f549d936-24e6-49e0-9acb',
      })

    const response = saveSettingResponse.body
    expect(saveSettingResponse.status).toBe(200)
    expect(response.sendEmail).toBe(false)
    expect(response.replyTo).toBe('example@gmail.com')
    expect(response.creditCardPrice).toBe(0.04)
    expect(response.slug).toBe('slug-test')
    expect(response.emailSender).toBe('Custom Sender')
    expect(response.checkoutConfigId).toBe('f549d936-24e6-49e0-9acb')

    // retrieve settings
    const getSettingResponse = await request(app)
      .get(`/v2/lock-settings/${network}/locks/${lockSettingMock.lockAddress}`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)

    expect(getSettingResponse.status).toBe(200)
    expect(getSettingResponse.body.sendEmail).toBe(false)
    expect(getSettingResponse.body.replyTo).toBe(lockSettingMock.replyTo)
    expect(getSettingResponse.body.lockAddress).toBe(
      lockSettingMock.lockAddress
    )
    expect(getSettingResponse.body.creditCardPrice).toBe(
      lockSettingMock.creditCardPrice
    )
    expect(getSettingResponse.body.slug).toBe(lockSettingMock.slug)
    expect(getSettingResponse.body.emailSender).toBe(
      lockSettingMock.emailSender
    )
    expect(getSettingResponse.body.checkoutConfigId).toBe(
      lockSettingMock.checkoutConfigId
    )
  })

  it('should retrieve default settings for a lock', async () => {
    expect.assertions(7)

    const { loginResponse } = await loginRandomUser(app)

    const getSettingResponse = await request(app)
      .get(`/v2/lock-settings/${network}/locks/${lockAddress2}`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)

    expect(getSettingResponse.status).toBe(200)
    expect(getSettingResponse.body.sendEmail).toBe(
      DEFAULT_LOCK_SETTINGS.sendEmail
    )
    expect(getSettingResponse.body.replyTo).toBe(undefined)
    expect(getSettingResponse.body.creditCardPrice).toBe(undefined)
    expect(getSettingResponse.body.slug).toBe(undefined)
    expect(getSettingResponse.body.emailSender).toBe(undefined)
    expect(getSettingResponse.body.checkoutConfigId).toBe(undefined)
  })

  it('should save null values for settings', async () => {
    expect.assertions(5)

    const { loginResponse } = await loginRandomUser(app)
    // save settings
    mockWeb3Service.isLockManager = vi.fn(() => Promise.resolve(true))
    const saveSettingResponse = await request(app)
      .post(`/v2/lock-settings/${network}/locks/${lockSettingMock.lockAddress}`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
      .send({
        replyTo: null,
        creditCardPrice: null,
        emailSender: null,
        checkoutConfigId: null,
      })

    const response = saveSettingResponse.body
    expect(saveSettingResponse.status).toBe(200)
    expect(response.replyTo).toBe(null)
    expect(response.creditCardPrice).toBe(null)
    expect(response.emailSender).toBe(null)
    expect(response.checkoutConfigId).toBe(null)
  })
})
