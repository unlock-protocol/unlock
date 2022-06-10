import request from 'supertest'
import { getWalletInput, loginRandomUser } from '../../test-helpers/utils'

const app = require('../../../src/app')

jest.setTimeout(600000)
const lockAddress = '0x3F09aD349a693bB62a162ff2ff3e097bD1cE9a8C'
const managedLock = '0xdCc44A9502239657578cB626C5afe9c2615733c0'
const network = 4

jest.mock('@unlock-protocol/unlock-js', () => {
  return {
    Web3Service: jest.fn().mockImplementation(() => {
      return {
        isLockManager: (lockAddress: string) => lockAddress === managedLock,
      }
    }),
  }
})

const mockDispatcher = {
  grantKeys: jest.fn((_lockAddress, _recipients, _network, _callback) => {
    _callback(null, '0x123')
  }),
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

  it('returns an error when authentication is there but the user is not a lock manager', async () => {
    expect.assertions(2)

    const { loginResponse, address } = await loginRandomUser(app)
    expect(loginResponse.status).toBe(200)

    const response = await request(app)
      .post(`/v2/api/grant/${network}/${lockAddress}`)
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
    expect(response.body.hash).toBe('0x123')
    expect(response.status).toBe(200)
  })
})
