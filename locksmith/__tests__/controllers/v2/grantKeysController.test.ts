import request from 'supertest'
import {
  getWalletInput,
  loginRandomUser,
  loginAsApplication,
} from '../../test-helpers/utils'

const app = require('../../../src/app')

jest.setTimeout(600000)
const lockAddress = '0x3F09aD349a693bB62a162ff2ff3e097bD1cE9a8C'
const managedLock = '0xdCc44A9502239657578cB626C5afe9c2615733c0'
const keyGranterLock = '0x7ffC57839B00206D1ad20c69A1981b489f772031'
const network = 4
const expensiveNetwork = 1000
const noGasNetwork = 2000

jest.mock('../../../src/utils/gasPrice', () => {
  return jest.fn(() => {
    return {
      gasPriceUSD: (network: number) =>
        expensiveNetwork === network ? 1000 : 0,
    }
  })
})

jest.mock('@unlock-protocol/unlock-js', () => {
  return {
    Web3Service: jest.fn().mockImplementation(() => {
      return {
        isLockManager: (lockAddress: string) => lockAddress === managedLock,
        isKeyGranter: (lockAddress: string) => lockAddress === keyGranterLock,
      }
    }),
  }
})

const mockDispatcher = {
  grantKeys: jest.fn((_lockAddress, _recipients, _network, _callback) => {
    _callback(null, '0x123')
  }),
  hasFundsForTransaction: (network: number) =>
    noGasNetwork === network ? false : true,
}

jest.mock('../../../src/fulfillment/dispatcher', () => {
  return jest.fn().mockImplementation(() => {
    return mockDispatcher
  })
})

describe('grantKeys endpoint', () => {
  it('returns an error when authentication is missing', async () => {
    expect.assertions(1)

    const { walletAddress: address } = await getWalletInput()

    const response = await request(app)
      .post(`/v2/api/grant/${network}/${lockAddress}`)
      .send({
        keys: [
          {
            recipient: '0xea674fdde714fd979de3edf0f56aa9716b898ec8',
            expiration: new Date().getTime() / 1000 + 60 * 60 * 24,
            manager: address,
          },
        ],
      })
    expect(response.status).toBe(403)
  })

  it('returns an error when authentication is there but the user is not a lock manager or key granter', async () => {
    expect.assertions(2)

    const { loginResponse, address, application } = await loginAsApplication(
      app,
      'WP'
    )
    expect(loginResponse.status).toBe(200)

    const response = await request(app)
      .post(`/v2/api/grant/${network}/${lockAddress}`)
      .set('Authorization', `Api-key ${application.key}`)
      .send({
        keys: [
          {
            recipient: '0xea674fdde714fd979de3edf0f56aa9716b898ec8',
            expiration: Math.floor(new Date().getTime() / 1000 + 60 * 60 * 24),
            manager: address,
          },
        ],
      })
    expect(response.status).toBe(401)
  })

  it('returns an error when authentication is not an application', async () => {
    expect.assertions(2)

    const { loginResponse, address } = await loginRandomUser(app)

    expect(loginResponse.status).toBe(200)

    const response = await request(app)
      .post(`/v2/api/grant/${network}/${managedLock}`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
      .send({
        keys: [
          {
            recipient: '0xea674fdde714fd979de3edf0f56aa9716b898ec8',
            expiration: Math.floor(new Date().getTime() / 1000 + 60 * 60 * 24),
            manager: address,
          },
        ],
      })
    expect(response.status).toBe(401)
  })

  it('grant keys if the caller is a lock manager', async () => {
    expect.assertions(3)

    const { loginResponse, address, application } = await loginAsApplication(
      app,
      'WP'
    )

    expect(loginResponse.status).toBe(200)

    const response = await request(app)
      .post(`/v2/api/grant/${network}/${managedLock}`)
      .set('Authorization', `Api-key ${application.key}`)
      .send({
        keys: [
          {
            recipient: '0xea674fdde714fd979de3edf0f56aa9716b898ec8',
            expiration: Math.floor(new Date().getTime() / 1000 + 60 * 60 * 24),
            manager: address,
          },
        ],
      })
    expect(response.body.hash).toBe('0x123')
    expect(response.status).toBe(200)
  })

  it('grant keys if the caller is a key granter', async () => {
    expect.assertions(3)

    const { loginResponse, address, application } = await loginAsApplication(
      app,
      'WP'
    )

    expect(loginResponse.status).toBe(200)

    const response = await request(app)
      .post(`/v2/api/grant/${network}/${keyGranterLock}`)
      .set('Authorization', `Api-key ${application.key}`)
      .send({
        keys: [
          {
            recipient: '0xea674fdde714fd979de3edf0f56aa9716b898ec8',
            expiration: Math.floor(new Date().getTime() / 1000 + 60 * 60 * 24),
            manager: address,
          },
        ],
      })
    expect(response.body.hash).toBe('0x123')
    expect(response.status).toBe(200)
  })

  it('returns an error when gas price is too high', async () => {
    expect.assertions(3)

    const { loginResponse, address, application } = await loginAsApplication(
      app,
      'WP'
    )

    expect(loginResponse.status).toBe(200)

    const response = await request(app)
      .post(`/v2/api/grant/${expensiveNetwork}/${managedLock}`)
      .set('Authorization', `Api-key ${application.key}`)
      .send({
        keys: [
          {
            recipient: '0xea674fdde714fd979de3edf0f56aa9716b898ec8',
            expiration: Math.floor(new Date().getTime() / 1000 + 60 * 60 * 24),
            manager: address,
          },
        ],
      })
    expect(response.body.error).toBe('Gas fees too high to grant keys')
    expect(response.status).toBe(500)
  })

  it('returns an error when the purchaser does not have enough funds', async () => {
    expect.assertions(3)

    const { loginResponse, address, application } = await loginAsApplication(
      app,
      'WP'
    )

    expect(loginResponse.status).toBe(200)

    const response = await request(app)
      .post(`/v2/api/grant/${noGasNetwork}/${managedLock}`)
      .set('Authorization', `Api-key ${application.key}`)
      .send({
        keys: [
          {
            recipient: '0xea674fdde714fd979de3edf0f56aa9716b898ec8',
            expiration: Math.floor(new Date().getTime() / 1000 + 60 * 60 * 24),
            manager: address,
          },
        ],
      })
    expect(response.body.error).toBe(
      'Purchaser does not have enough to pay for gas on 2000'
    )
    expect(response.status).toBe(500)
  })
})
