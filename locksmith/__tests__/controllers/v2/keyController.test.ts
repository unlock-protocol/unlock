import request from 'supertest'
import { loginRandomUser } from '../../test-helpers/utils'
import app from '../../app'
import { vi, expect } from 'vitest'

// mock pdfmake
vi.mock('pdfmake/build/pdfmake', () => ({
  default: {
    vfs: {},
    createPdf: vi.fn(),
  },
}))

vi.mock('pdfmake/build/vfs_fonts', () => ({
  default: {
    pdfMake: {
      vfs: {},
    },
  },
}))

const lockAddress = '0x62CcB13A72E6F991dE53b9B7AC42885151588Cd2'
const wrongLockAddress = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
const network = 4

const lock = {
  address: lockAddress,
  totalKeys: 5,
  keys: [
    {
      owner: '0x4Ff5A116Ff945cC744346cFd32c6C6e3d3a018Ff',
      tokenId: '1',
      expiration:
        '115792089237316195423570985008687907853269984665640564039457584007913129639935',
    },
    {
      owner: '0xf44fF7951688BFbBb573967FfcB0D8aabDaF36c9',
      tokenId: '2',
      expiration:
        '115792089237316195423570985008687907853269984665640564039457584007913129639935',
    },
    {
      owner: '0x3FEE1f4175001802d3828B76068B8d898E72a25a',
      tokenId: '3',
      expiration:
        '115792089237316195423570985008687907853269984665640564039457584007913129639935',
    },
    {
      owner: '0xfF24307539A043E7fA40C4582090B3029de26b41',
      tokenId: '42',
      expiration:
        '115792089237316195423570985008687907853269984665640564039457584007913129639935',
    },
    {
      owner: '0x77ccc37a6d89a75A29cDaA74e757599efC4b30f5',
      tokenId: '43',
      expiration:
        '115792089237316195423570985008687907853269984665640564039457584007913129639935',
    },
  ],
}

const metadatas = [
  {
    userAddress: '0x4Ff5A116Ff945cC744346cFd32c6C6e3d3a018Ff',
    data: { extraMetadata: { checkedInAt: 1660812048626 } },
  },
  {
    userAddress: '0xf44fF7951688BFbBb573967FfcB0D8aabDaF36c9',
    data: { extraMetadata: { checkedInAt: 1660812066160 } },
  },
  {
    userAddress: '0xfF24307539A043E7fA40C4582090B3029de26b41',
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
    userAddress: '0x77ccc37a6d89a75A29cDaA74e757599efC4b30f5',
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
    keysByQuery: async () => {
      return Promise.resolve([lock])
    },
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

describe('Keys v2 endpoints for lock when using paginated endpoint', () => {
  it('should throw an error when endpoint does not have query parameters', async () => {
    expect.assertions(2)
    const { loginResponse } = await loginRandomUser(app)
    expect(loginResponse.status).toBe(200)

    const getKeysResponse = await request(app)
      .get(`/v2/api/${network}/locks/${lockAddress}/keys-by-page`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)

    expect(getKeysResponse.status).toBe(404)
  })

  it('should contain metadata when caller is the lockManager', async () => {
    expect.assertions(8)

    const { loginResponse } = await loginRandomUser(app)
    const queryParams = {
      query: '43',
      filterKey: 'tokenId',
      expiration: 'all',
    }
    const getKeysResponse = await request(app)
      .get(`/v2/api/${network}/locks/${lockAddress}/keys-by-page`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
      .query(queryParams)

    expect(getKeysResponse.status).toBe(200)
    expect(getKeysResponse.body.keys.length).toBe(1)
    expect(getKeysResponse.body.keys[0].email).toBe('example@gmai.com')
    expect(getKeysResponse.body.keys[0].address).toBe('brescia')
    expect(getKeysResponse.body.keys[0].firstname).toBe('mario rossi')
    expect(getKeysResponse.body.meta.total).toBe(5)
    expect(getKeysResponse.body.meta.page).toBe(0)
    expect(getKeysResponse.body.meta.byPage).toBe(30)
  })

  it('should not contains metadata when caller is not lockManager', async () => {
    expect.assertions(8)

    const { loginResponse } = await loginRandomUser(app)
    const lockAddress = wrongLockAddress
    const getKeysResponse = await request(app)
      .get(`/v2/api/${network}/locks/${lockAddress}/keys-by-page`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
      .query({
        query: '42',
        filterKey: 'tokenId',
        expiration: 'all',
      })

    expect(getKeysResponse.status).toBe(200)
    expect(getKeysResponse.body.keys.length).toBe(1)
    expect(getKeysResponse.body.keys[0].email).toBe(undefined)
    expect(getKeysResponse.body.keys[0].address).toBe(undefined)
    expect(getKeysResponse.body.keys[0].firstname).toBe(undefined)
    expect(getKeysResponse.body.meta.total).toBe(5)
    expect(getKeysResponse.body.meta.page).toBe(0)
    expect(getKeysResponse.body.meta.byPage).toBe(30)
  })

  it('should get all keys list without errors', async () => {
    expect.assertions(3)

    const { loginResponse } = await loginRandomUser(app)
    const getKeysResponse = await request(app)
      .get(`/v2/api/${network}/locks/${lockAddress}/keys-by-page`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
      .query({
        query: '',
        filterKey: 'owner',
        expiration: 'active',
      })

    expect(getKeysResponse.status).toBe(200)

    expect(Array.isArray(getKeysResponse.body.keys)).toStrictEqual(true)
    expect(getKeysResponse.body.keys.length).toBe(5)
  })

  it('should not have results on query with non existing owner', async () => {
    expect.assertions(2)

    const { loginResponse } = await loginRandomUser(app)
    const getKeysResponse = await request(app)
      .get(`/v2/api/${network}/locks/${lockAddress}/keys-by-page`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
      .query({
        query: 'NOT_VALID',
        filterKey: 'owner',
        expiration: 'all',
      })

    expect(getKeysResponse.status).toBe(200)

    expect(getKeysResponse.body.keys.length).toStrictEqual(0)
  })

  it('should return all keys when with empty email query', async () => {
    expect.assertions(2)

    const { loginResponse } = await loginRandomUser(app)
    const getKeysResponse = await request(app)
      .get(`/v2/api/${network}/locks/${lockAddress}/keys-by-page`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
      .query({
        query: '',
        filterKey: 'email',
        expiration: 'all',
      })

    expect(getKeysResponse.status).toBe(200)

    expect(getKeysResponse.body.keys.length).toBe(5)
  })

  it('should search by specific keyHolderAddress', async () => {
    expect.assertions(4)

    const { loginResponse } = await loginRandomUser(app)
    const getKeysResponse = await request(app)
      .get(`/v2/api/${network}/locks/${lockAddress}/keys-by-page`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
      .query({
        query: '0xff24307539a043e7fa40c45820',
        filterKey: 'owner',
        expiration: 'all',
      })

    expect(getKeysResponse.status).toBe(200)

    expect(Array.isArray(getKeysResponse.body.keys)).toStrictEqual(true)
    expect(getKeysResponse.body.keys.length).toBe(1)
    expect(getKeysResponse.body.keys[0].token).toBe('42')
  })

  it('should return all keys when tokenId query is empty', async () => {
    expect.assertions(2)

    const { loginResponse } = await loginRandomUser(app)
    const getKeysResponse = await request(app)
      .get(`/v2/api/${network}/locks/${lockAddress}/keys-by-page`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
      .query({
        query: '',
        filterKey: 'tokenId',
        expiration: 'all',
      })

    expect(getKeysResponse.status).toBe(200)
    expect(getKeysResponse.body.keys.length).toBe(5)
  })

  it('should return results with query on existing tokenId', async () => {
    expect.assertions(2)

    const { loginResponse } = await loginRandomUser(app)
    const getKeysResponse = await request(app)
      .get(`/v2/api/${network}/locks/${lockAddress}/keys-by-page`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
      .query({
        query: '2',
        filterKey: 'tokenId',
        expiration: 'active',
      })

    expect(getKeysResponse.status).toBe(200)
    expect(getKeysResponse.body.keys.length).not.toBe(0)
  })

  it('should not have results with not valid tokenId query', async () => {
    expect.assertions(2)

    const { loginResponse } = await loginRandomUser(app)
    const getKeysResponse = await request(app)
      .get(`/v2/api/${network}/locks/${lockAddress}/keys-by-page`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
      .query({
        query: '424',
        filterKey: 'tokenId',
        expiration: 'all',
      })

    expect(getKeysResponse.status).toBe(200)
    expect(getKeysResponse.body.keys.length).toStrictEqual(0)
  })

  it('should get keys marked as checkedIn', async () => {
    expect.assertions(2)

    const { loginResponse } = await loginRandomUser(app)
    const getKeysResponse = await request(app)
      .get(`/v2/api/${network}/locks/${lockAddress}/keys-by-page`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
      .query({
        query: '',
        filterKey: 'checkedInAt',
        expiration: 'all',
      })

    expect(getKeysResponse.status).toBe(200)
    expect(getKeysResponse.body.keys.length).toBe(2)
  })
})
