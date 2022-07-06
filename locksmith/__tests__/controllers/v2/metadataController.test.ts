import { ethers } from 'ethers'
import request from 'supertest'
import { loginRandomUser } from '../../test-helpers/utils'
import verifierOperations from '../../../src/operations/verifierOperations'

const app = require('../../../src/app')

jest.setTimeout(600000)

let owner = `0x00192fb10df37c9fb26829eb2cc623cd1bf599e8`
let lockManager = `0x00192fb10df37c9fb26829eb2cc623cd1bf599e8`
const lockAddress = '0x3F09aD349a693bB62a162ff2ff3e097bD1cE9a8C'
const keyId = 100

jest.mock('@unlock-protocol/unlock-js', () => {
  return {
    Web3Service: jest.fn().mockImplementation(() => {
      return {
        isLockManager: (lock: string, manager: string) =>
          lockAddress === lock || manager === lockManager,
        ownerOf: (_lockAddress: string, _tokenId: string, _network: number) =>
          owner,
      }
    }),
  }
})

const lockPayload = {
  keys: [
    {
      owner: {
        address: '0xf91c12615592195626a464cc9a8ddebb88a79b59',
      },
      keyId: '1',
      expiration: '1658416869',
    },
  ],
  address: '0x0b9def7d8595b19d9d5464929c107074aa594304',
  owner: '0x7e44d95df5cc9a2e85f17a08120b28f4ee8a04cc',
}

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

  it('get key metadata', async () => {
    expect.assertions(2)
    const lockAddress = await ethers.Wallet.createRandom().getAddress()
    const keyMetadataResponse = await request(app).get(
      `/v2/api/metadata/100/locks/${lockAddress}/keys/1`
    )
    expect(keyMetadataResponse.status).toBe(200)
    expect(keyMetadataResponse.body.userMetadata).toBe(undefined)
  })

  describe('get key metadata', () => {
    let loginResponse: any

    beforeEach(async () => {
      const response = await loginRandomUser(app)
      owner = response.address
      loginResponse = response.loginResponse

      // Store user data for the owner of the key
      const metadata = {
        public: {
          firstname: 'Jane',
          lastname: 'Doe',
        },
        protected: {
          email: 'jane@unlock-protocol.com',
          zipCode: 11217,
        },
      }

      await request(app)
        .post(`/v2/api/metadata/100/locks/${lockAddress}/users/${owner}`)
        .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
        .send({ metadata })
    })

    describe('get key metadata, as an authorized used', () => {
      it('includes the protected part as a key owner', async () => {
        expect.assertions(2)

        const keyMetadata = await request(app)
          .get(`/v2/api/metadata/100/locks/${lockAddress}/keys/${keyId}`)
          .set('authorization', `Bearer ${loginResponse.body.accessToken}`)

        expect(keyMetadata.status).toBe(200)
        expect(keyMetadata.body.userMetadata.protected).toStrictEqual({
          email: 'jane@unlock-protocol.com',
          zipCode: 11217,
        })
      })

      it('includes the protected part as a verifier', async () => {
        expect.assertions(3)
        const { loginResponse, address } = await loginRandomUser(app)
        expect(loginResponse.status).toBe(200)

        // Add the new user as a verifier
        await verifierOperations.createVerifier(
          lockAddress,
          address,
          lockManager,
          100
        )

        const keyMetadata = await request(app)
          .get(`/v2/api/metadata/100/locks/${lockAddress}/keys/${keyId}`)
          .set('authorization', `Bearer ${loginResponse.body.accessToken}`)

        expect(keyMetadata.status).toBe(200)
        expect(keyMetadata.body.userMetadata.protected).toStrictEqual({
          email: 'jane@unlock-protocol.com',
          zipCode: 11217,
        })
      })

      it('includes the protected part as a lock manager', async () => {
        expect.assertions(3)
        const { loginResponse, address } = await loginRandomUser(app)
        expect(loginResponse.status).toBe(200)
        lockManager = address

        const keyMetadata = await request(app)
          .get(`/v2/api/metadata/100/locks/${lockAddress}/keys/${keyId}`)
          .set('authorization', `Bearer ${loginResponse.body.accessToken}`)

        expect(keyMetadata.status).toBe(200)
        expect(keyMetadata.body.userMetadata.protected).toStrictEqual({
          email: 'jane@unlock-protocol.com',
          zipCode: 11217,
        })
      })
    })

    describe('as a non-authorized used', () => {
      it('does not include the protected part', async () => {
        expect.assertions(2)
        const lockAddress = await ethers.Wallet.createRandom().getAddress()

        const keyMetadata = await request(app).get(
          `/v2/api/metadata/100/locks/${lockAddress}/keys/${keyId}`
        )

        expect(keyMetadata.status).toBe(200)
        expect(keyMetadata.body.protected).toBe(undefined)
      })
    })
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
    const lockAddressMetadataResponse = await request(app).put(
      `/v2/api/metadata/4/locks/${lockAddress}/keys`
    )
    expect(lockAddressMetadataResponse.status).toBe(403)
  })

  it('Bulk lock metadata returns no error when authentication is present and user is lock manager', async () => {
    expect.assertions(2)

    const { loginResponse } = await loginRandomUser(app)
    expect(loginResponse.status).toBe(200)

    const lockAddressMetadataResponse = await request(app)
      .put(`/v2/api/metadata/4/locks/${lockAddress}/keys`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
      .send(lockPayload)

    expect(lockAddressMetadataResponse.status).toBe(200)
  })

  it('Bulk lock metadata returns error when authentication is present and user is not the lock manager', async () => {
    expect.assertions(2)

    const { loginResponse } = await loginRandomUser(app)
    expect(loginResponse.status).toBe(200)

    const lockAddress = await ethers.Wallet.createRandom().getAddress()
    const lockAddressMetadataResponse = await request(app)
      .put(`/v2/api/metadata/4/locks/${lockAddress}/keys`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)

    expect(lockAddressMetadataResponse.status).toBe(401)
  })

  it('Does return error when authentication is present and payload is wrong', async () => {
    expect.assertions(2)

    const { loginResponse } = await loginRandomUser(app)
    expect(loginResponse.status).toBe(200)

    const lockAddressMetadataResponse = await request(app)
      .put(`/v2/api/metadata/4/locks/${lockAddress}/keys`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
      .send(lockPayload.keys)

    expect(lockAddressMetadataResponse.status).toBe(400)
  })
})
