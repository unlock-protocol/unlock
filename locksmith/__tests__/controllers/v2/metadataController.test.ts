import { ethers } from 'ethers'
import request from 'supertest'

const app = require('../../../src/app')

jest.setTimeout(10000)

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
      .post(
        `/v2/metadata/100/locks/${lockAddress}/users/${walletAddress}/keys/1`
      )
      .send({ metadata })

    expect(userMetadataResponse.status).toBe(201)
    expect(userMetadataResponse.body).toStrictEqual(metadata)
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
      .post('/v2/metadata/100/users')
      .send({ users })

    const usersMetadata = userMetadataResponse.body.result.map(
      (user: any) => user.data
    )
    const expectedUsersMetadata = users.map((user) => user.metadata)
    expect(userMetadataResponse.status).toBe(201)
    expect(usersMetadata).toStrictEqual(expectedUsersMetadata)
  })
})
