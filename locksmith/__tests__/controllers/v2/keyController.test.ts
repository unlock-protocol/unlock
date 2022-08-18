import request from 'supertest'
import { loginRandomUser } from '../../test-helpers/utils'

const app = require('../../../src/app')

jest.setTimeout(600000)

const lockAddress = '0x62ccb13a72e6f991de53b9b7ac42885151588cd2'
const network = 4

const lock = {
  keys: [
    {
      owner: { address: '0x4ff5a116ff945cc744346cfd32c6c6e3d3a018ff' },
      keyId: '1',
      expiration:
        '115792089237316195423570985008687907853269984665640564039457584007913129639935',
    },
    {
      owner: { address: '0xf44ff7951688bfbbb573967ffcb0d8aabdaf36c9' },
      keyId: '2',
      expiration:
        '115792089237316195423570985008687907853269984665640564039457584007913129639935',
    },
    {
      owner: { address: '0x3fee1f4175001802d3828b76068b8d898e72a25a' },
      keyId: '3',
      expiration:
        '115792089237316195423570985008687907853269984665640564039457584007913129639935',
    },
    {
      owner: { address: '0xff24307539a043e7fa40c4582090b3029de26b41' },
      keyId: '42',
      expiration:
        '115792089237316195423570985008687907853269984665640564039457584007913129639935',
    },
    {
      owner: { address: '0x77ccc37a6d89a75a29cdaa74e757599efc4b30f5' },
      keyId: '43',
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

jest.mock('../../../src/operations/metadataOperations', () => {
  return {
    getKeysMetadata: () => {
      return metadatas
    },
  }
})

jest.mock('../../../src/graphql/datasource/keysByQuery', () => {
  return {
    Keys: jest.fn().mockImplementation(() => {
      return {
        get: jest.fn().mockImplementation(() => {
          return Promise.resolve([lock])
        }),
      }
    }),
  }
})

jest.mock('@unlock-protocol/unlock-js', () => {
  return {
    Web3Service: jest.fn().mockImplementation(() => {
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
        filterKey: 'keyId',
        expiration: 'all',
      })

    const [res] = getKeysResponse.body
    expect(getKeysResponse.status).toBe(200)
    expect(getKeysResponse.body.length).toBe(1)
    expect(res.email).toBe('example@gmai.com')
    expect(res.address).toBe('brescia')
    expect(res.firstname).toBe('mario rossi')
  })

  it('should not containts metadata when caller is not lockManager', async () => {
    expect.assertions(5)

    const { loginResponse, address } = await loginRandomUser(app)
    const lockAddress = address
    const getKeysResponse = await request(app)
      .get(`/v2/api/${network}/locks/${lockAddress}/keys`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
      .query({
        query: '42',
        filterKey: 'keyId',
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

  it('should return all keys when keyId query is empty', async () => {
    expect.assertions(2)

    const { loginResponse } = await loginRandomUser(app)
    const getKeysResponse = await request(app)
      .get(`/v2/api/${network}/locks/${lockAddress}/keys`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
      .query({
        query: '',
        filterKey: 'keyId',
        expiration: 'all',
      })

    expect(getKeysResponse.status).toBe(200)
    expect(getKeysResponse.body.length).toBe(5)
  })

  it('should return results with query on existing keyId', async () => {
    expect.assertions(2)

    const { loginResponse } = await loginRandomUser(app)
    const getKeysResponse = await request(app)
      .get(`/v2/api/${network}/locks/${lockAddress}/keys`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
      .query({
        query: '2',
        filterKey: 'keyId',
        expiration: 'active',
      })

    expect(getKeysResponse.status).toBe(200)
    expect(getKeysResponse.body.length).not.toBe(0)
  })

  it('should not have results with not valid keyId query', async () => {
    expect.assertions(2)

    const { loginResponse } = await loginRandomUser(app)
    const getKeysResponse = await request(app)
      .get(`/v2/api/${network}/locks/${lockAddress}/keys`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
      .query({
        query: '424',
        filterKey: 'keyId',
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
