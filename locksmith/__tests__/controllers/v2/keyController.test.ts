import request from 'supertest'
import { loginRandomUser } from '../../test-helpers/utils'

const app = require('../../../src/app')

jest.setTimeout(600000)

const lockAddress = '0x62ccb13a72e6f991de53b9b7ac42885151588cd2'
const network = 4

jest.mock('@unlock-protocol/unlock-js', () => {
  return {
    Web3Service: jest.fn().mockImplementation(() => {
      return {
        isLockManager: (lock: string) => lockAddress === lock,
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

  it('should get keys list without error with query filters', async () => {
    expect.assertions(7)

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
    const [firstItem] = getKeysResponse.body ?? []
    expect(firstItem).toHaveProperty('token')
    expect(firstItem).toHaveProperty('lockName')
    expect(firstItem).toHaveProperty('expiration')
    expect(firstItem).toHaveProperty('keyholderAddress')
    expect(firstItem).toHaveProperty('lockAddress')
  })

  it('should search by empty query and get all results', async () => {
    expect.assertions(3)

    const { loginResponse } = await loginRandomUser(app)
    const getKeysResponse = await request(app)
      .get(`/v2/api/${network}/locks/${lockAddress}/keys`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
      .query({
        query: '',
        filterKey: 'owner',
        expiration: 'all',
      })

    expect(getKeysResponse.status).toBe(200)

    expect(Array.isArray(getKeysResponse.body)).toStrictEqual(true)
    expect(getKeysResponse.body.length).not.toBe(0)
  })

  it('should search by random query and not have results', async () => {
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

  it('should search by empty email query and get all results', async () => {
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

    expect(getKeysResponse.body.length).not.toStrictEqual(0)
  })

  it('should search by empty keyId query and get all results', async () => {
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

    expect(getKeysResponse.body.length).not.toStrictEqual(0)
  })

  it('it search by specific keyId query', async () => {
    expect.assertions(3)

    const { loginResponse } = await loginRandomUser(app)
    const getKeysResponse = await request(app)
      .get(`/v2/api/${network}/locks/${lockAddress}/keys`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
      .query({
        query: '4',
        filterKey: 'keyId',
        expiration: 'all',
      })

    const [data] = getKeysResponse.body
    expect(getKeysResponse.status).toBe(200)
    expect(getKeysResponse.body.length).toStrictEqual(1)
    expect(data.token).toStrictEqual('4')
  })
})
