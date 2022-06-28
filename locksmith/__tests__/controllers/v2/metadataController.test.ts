import { ethers } from 'ethers'
import request from 'supertest'
import { loginRandomUser } from '../../test-helpers/utils'

const app = require('../../../src/app')

jest.setTimeout(600000)
const lockAddress = '0x3F09aD349a693bB62a162ff2ff3e097bD1cE9a8C'

jest.mock('@unlock-protocol/unlock-js', () => {
  return {
    Web3Service: jest.fn().mockImplementation(() => {
      return {
        isLockManager: (lock: string) => lockAddress === lock,
      }
    }),
  }
})

describe('Metadata v2 endpoints for locksmith', () => {
  it('Add metadata to user', async () => {
    expect.assertions(2)
    const lockAddress = await ethers.Wallet.createRandom().getAddress()
    const walletAddress = await ethers.Wallet.createRandom().getAddress()
    const metadata = {
      public: {
        username: 'example',
      },
      protected: {
        email: 'test@example.com',
      },
    }
    const userMetadataResponse = await request(app)
      .post(`/v2/api/metadata/100/locks/${lockAddress}/users/${walletAddress}`)
      .send({ metadata })

    expect(userMetadataResponse.status).toBe(201)
    expect(userMetadataResponse.body).toStrictEqual({
      userMetadata: metadata,
    })
  })

  it('Add invalid user metadata', async () => {
    expect.assertions(2)
    const lockAddress = await ethers.Wallet.createRandom().getAddress()
    const walletAddress = await ethers.Wallet.createRandom().getAddress()

    const metadata = {
      badMetadataForm: {},
    }

    const userMetadataResponse = await request(app)
      .post(`/v2/api/metadata/100/locks/${lockAddress}/users/${walletAddress}`)
      .send({ metadata })

    expect(userMetadataResponse.status).toBe(400)
    expect(userMetadataResponse.body.error).not.toBe(undefined)
  })

  it('Add metadata to users in bulk', async () => {
    expect.assertions(2)
    const users = await Promise.all(
      Array(3)
        .fill(0)
        .map(async (_, index) => {
          const lockAddress = await ethers.Wallet.createRandom().getAddress()
          const userAddress = await ethers.Wallet.createRandom().getAddress()
          const metadata = {
            public: {
              username: userAddress.slice(5),
            },
            protected: {
              email: `${index}@example.com`,
            },
          }
          const keyId = String(index + 1)
          return {
            userAddress,
            keyId,
            lockAddress,
            metadata,
          }
        })
    )

    const userMetadataResponse = await request(app)
      .post('/v2/api/metadata/100/users')
      .send({ users })

    const usersMetadata = userMetadataResponse.body.result.map(
      (user: any) => user.data
    )
    const expectedUsersMetadata = users.map((user) => ({
      userMetadata: user.metadata,
    }))
    expect(userMetadataResponse.status).toBe(201)
    expect(usersMetadata).toStrictEqual(expectedUsersMetadata)
  })

  it('Add bulk broken user metadata', async () => {
    expect.assertions(2)

    const users = await Promise.all(
      Array(3)
        .fill(0)
        .map(async (_, index) => {
          const lockAddress = await ethers.Wallet.createRandom().getAddress()
          const userAddress = await ethers.Wallet.createRandom().getAddress()
          const metadata = {
            public: {
              username: userAddress.slice(5),
            },
            blah: {
              private: true,
            },
          }
          const keyId = String(index + 1)
          return {
            userAddress,
            keyId,
            lockAddress,
            metadata,
          }
        })
    )

    const userMetadataResponse = await request(app)
      .post('/v2/api/metadata/100/users')
      .send({ users })

    expect(userMetadataResponse.status).toBe(400)
    expect(userMetadataResponse.body.error).not.toBe(undefined)
  })

  it('Get key metadata', async () => {
    expect.assertions(2)
    const lockAddress = await ethers.Wallet.createRandom().getAddress()
    const keyMetadataResponse = await request(app).get(
      `/v2/api/metadata/100/locks/${lockAddress}/keys/1`
    )
    expect(keyMetadataResponse.status).toBe(200)
    expect(keyMetadataResponse.body.userMetadata).toBe(undefined)
  })

  it('Get lock metadata', async () => {
    expect.assertions(1)
    const lockAddress = await ethers.Wallet.createRandom().getAddress()
    const lockMetadataResponse = await request(app).get(
      `/v2/api/metadata/100/locks/${lockAddress}`
    )
    expect(lockMetadataResponse.status).toBe(404)
  })

  it('Bulk lock metadata returns error without authentication', async () => {
    expect.assertions(1)

    const lockAddress = await ethers.Wallet.createRandom().getAddress()
    const lockAddressMetadataResponse = await request(app).get(
      `/v2/api/metadata/4/${lockAddress}/data`
    )
    expect(lockAddressMetadataResponse.status).toBe(403)
  })

  it('Bulk lock metadata returns no error when authentication is present and user is lock manager', async () => {
    expect.assertions(2)

    const { loginResponse } = await loginRandomUser(app)
    expect(loginResponse.status).toBe(200)

    const lockAddressMetadataResponse = await request(app)
      .get(`/v2/api/metadata/4/${lockAddress}/data`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)

    expect(lockAddressMetadataResponse.status).toBe(200)
  })

  it('Bulk lock metadata returns error when authentication is present and user is not the lock manager', async () => {
    expect.assertions(2)

    const { loginResponse } = await loginRandomUser(app)
    expect(loginResponse.status).toBe(200)

    const lockAddress = await ethers.Wallet.createRandom().getAddress()
    const lockAddressMetadataResponse = await request(app)
      .get(`/v2/api/metadata/4/${lockAddress}/data`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)

    expect(lockAddressMetadataResponse.status).toBe(401)
  })
})
