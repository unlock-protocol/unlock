import request from 'supertest'
import { loginRandomUser } from '../../test-helpers/utils'
import app from '../../../src/server'
import { vi } from 'vitest'

const lockAddress = '0x62ccb13a72e6f991de53b9b7ac42885151588cd2'
const wrongLockAddress = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
const network = 4

const lock = {
  keys: [
    {
      owner: '0x4ff5a116ff945cc744346cfd32c6c6e3d3a018ff',
      tokenId: '1',
      expiration:
        '115792089237316195423570985008687907853269984665640564039457584007913129639935',
    },
    {
      owner: '0xf44ff7951688bfbbb573967ffcb0d8aabdaf36c9',
      tokenId: '2',
      expiration:
        '115792089237316195423570985008687907853269984665640564039457584007913129639935',
    },
    {
      owner: '0x3fee1f4175001802d3828b76068b8d898e72a25a',
      tokenId: '3',
      expiration:
        '115792089237316195423570985008687907853269984665640564039457584007913129639935',
    },
    {
      owner: '0xff24307539a043e7fa40c4582090b3029de26b41',
      tokenId: '42',
      expiration:
        '115792089237316195423570985008687907853269984665640564039457584007913129639935',
    },
    {
      owner: '0x77ccc37a6d89a75a29cdaa74e757599efc4b30f5',
      tokenId: '43',
      expiration:
        '115792089237316195423570985008687907853269984665640564039457584007913129639935',
    },
  ],
}

const metadatas = [
  {
    userAddress: '0x4ff5a116ff945cc744346cfd32c6c6e3d3a018ff',
    data: { extraMetadata: { checkedInAt: 1660812048626 } },
  },
  {
    userAddress: '0xf44ff7951688bfbbb573967ffcb0d8aabdaf36c9',
    data: { extraMetadata: { checkedInAt: 1660812066160 } },
  },
  {
    userAddress: '0xff24307539a043e7fa40c4582090b3029de26b41',
    data: {
      userMetadata: {
        public: {},
        protected: {
          email: 'kld.diagne@gmail.com',
          address: 'email address',
          firstname: 'kalidou',
        },
      },
      extraMetadata: {},
    },
  },
  {
    userAddress: '0x77ccc37a6d89a75a29cdaa74e757599efc4b30f5',
    data: {
      userMetadata: {
        public: {},
        protected: {
          email: 'example@gmai.com',
          address: 'brescia',
          firstname: 'mario rossi',
        },
      },
      extraMetadata: {},
    },
  },
]

vi.mock('../../../src/operations/metadataOperations', () => {
  return {
    getKeysMetadata: () => {
      return metadatas
    },
  }
})

vi.mock('../../../src/graphql/datasource/keysByQuery', () => {
  return {
    keysByQuery: vi.fn().mockImplementation(() => {
      return {
        get: vi.fn().mockImplementation(() => {
          return Promise.resolve([lock])
        }),
      }
    }),
  }
})

vi.mock('@unlock-protocol/unlock-js', () => {
  return {
    Web3Service: vi.fn().mockImplementation(() => {
      return {
        isLockManager: (lock: string) =>
          lockAddress.toLowerCase() === lock.toLowerCase(),
      }
    }),
  }
})

describe('Keys v2 endpoints for lock', () => {
  it('should throw an error when endpoint does not have query parameters', async () => {
    expect.assertions(2)
    const { loginResponse } = await loginRandomUser(app)
    expect(loginResponse.status).toBe(200)

    const getKeysResponse = await request(app)
      .get(`/v2/api/${network}/locks/${lockAddress}/keys`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)

    expect(getKeysResponse.status).toBe(404)
  })

  it('should contain metadata when caller is the lockManager', async () => {
    expect.assertions(5)

    const { loginResponse } = await loginRandomUser(app)
    const getKeysResponse = await request(app)
      .get(`/v2/api/${network}/locks/${lockAddress}/keys`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
      .query({
        query: '43',
        filterKey: 'tokenId',
        expiration: 'all',
      })

    const [res] = getKeysResponse.body
    expect(getKeysResponse.status).toBe(200)
    expect(getKeysResponse.body.length).toBe(1)
    expect(res.email).toBe('example@gmai.com')
    expect(res.address).toBe('brescia')
    expect(res.firstname).toBe('mario rossi')
  })

  it('should not contains metadata when caller is not lockManager', async () => {
    expect.assertions(5)

    const { loginResponse } = await loginRandomUser(app)
    const lockAddress = wrongLockAddress
    const getKeysResponse = await request(app)
      .get(`/v2/api/${network}/locks/${lockAddress}/keys`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
      .query({
        query: '42',
        filterKey: 'tokenId',
        expiration: 'all',
      })

    const [res] = getKeysResponse.body
    expect(getKeysResponse.status).toBe(200)
    expect(getKeysResponse.body.length).toBe(1)
    expect(res.email).toBe(undefined)
    expect(res.address).toBe(undefined)
    expect(res.firstname).toBe(undefined)
  })

  it('should get all keys list without errors', async () => {
    expect.assertions(3)

    const { loginResponse } = await loginRandomUser(app)
    const getKeysResponse = await request(app)
      .get(`/v2/api/${network}/locks/${lockAddress}/keys`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
      .query({
        query: '',
        filterKey: 'owner',
        expiration: 'active',
      })

    expect(getKeysResponse.status).toBe(200)

    expect(Array.isArray(getKeysResponse.body)).toStrictEqual(true)
    expect(getKeysResponse.body.length).toBe(5)
  })

  it('should not have results on query with non existing owner', async () => {
    expect.assertions(2)

    const { loginResponse } = await loginRandomUser(app)
    const getKeysResponse = await request(app)
      .get(`/v2/api/${network}/locks/${lockAddress}/keys`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
      .query({
        query: 'NOT_VALID',
        filterKey: 'owner',
        expiration: 'all',
      })

    expect(getKeysResponse.status).toBe(200)

    expect(getKeysResponse.body.length).toStrictEqual(0)
  })

  it('should return all keys when with empty email query', async () => {
    expect.assertions(2)

    const { loginResponse } = await loginRandomUser(app)
    const getKeysResponse = await request(app)
      .get(`/v2/api/${network}/locks/${lockAddress}/keys`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
      .query({
        query: '',
        filterKey: 'email',
        expiration: 'all',
      })

    expect(getKeysResponse.status).toBe(200)

    expect(getKeysResponse.body.length).toBe(5)
  })

  it('should search by specific keyHolderAddress', async () => {
    expect.assertions(4)

    const { loginResponse } = await loginRandomUser(app)
    const getKeysResponse = await request(app)
      .get(`/v2/api/${network}/locks/${lockAddress}/keys`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
      .query({
        query: '0xff24307539a043e7fa40c45820',
        filterKey: 'owner',
        expiration: 'all',
      })

    expect(getKeysResponse.status).toBe(200)

    expect(Array.isArray(getKeysResponse.body)).toStrictEqual(true)
    expect(getKeysResponse.body.length).toBe(1)
    expect(getKeysResponse.body[0].token).toBe('42')
  })

  it('should return all keys when tokenId query is empty', async () => {
    expect.assertions(2)

    const { loginResponse } = await loginRandomUser(app)
    const getKeysResponse = await request(app)
      .get(`/v2/api/${network}/locks/${lockAddress}/keys`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
      .query({
        query: '',
        filterKey: 'tokenId',
        expiration: 'all',
      })

    expect(getKeysResponse.status).toBe(200)
    expect(getKeysResponse.body.length).toBe(5)
  })

  it('should return results with query on existing tokenId', async () => {
    expect.assertions(2)

    const { loginResponse } = await loginRandomUser(app)
    const getKeysResponse = await request(app)
      .get(`/v2/api/${network}/locks/${lockAddress}/keys`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
      .query({
        query: '2',
        filterKey: 'tokenId',
        expiration: 'active',
      })

    expect(getKeysResponse.status).toBe(200)
    expect(getKeysResponse.body.length).not.toBe(0)
  })

  it('should not have results with not valid tokenId query', async () => {
    expect.assertions(2)

    const { loginResponse } = await loginRandomUser(app)
    const getKeysResponse = await request(app)
      .get(`/v2/api/${network}/locks/${lockAddress}/keys`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
      .query({
        query: '424',
        filterKey: 'tokenId',
        expiration: 'all',
      })

    expect(getKeysResponse.status).toBe(200)
    expect(getKeysResponse.body.length).toStrictEqual(0)
  })

  it('should get keys marked as checkedIn', async () => {
    expect.assertions(2)

    const { loginResponse } = await loginRandomUser(app)
    const getKeysResponse = await request(app)
      .get(`/v2/api/${network}/locks/${lockAddress}/keys`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
      .query({
        query: '',
        filterKey: 'checkedInAt',
        expiration: 'all',
      })

    expect(getKeysResponse.status).toBe(200)
    expect(getKeysResponse.body.length).toBe(2)
  })
})
