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

describe('Member v2 endpoints for locksmith', () => {
  it('should get members without filters throw error', async () => {
    expect.assertions(2)
    const { loginResponse } = await loginRandomUser(app)
    expect(loginResponse.status).toBe(200)

    const getMembersResponse = await request(app)
      .get(`/v2/api/member/${network}/locks/${lockAddress}/members`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)

    expect(getMembersResponse.status).toBe(404)
  })

  it('should get members list without error with query filters', async () => {
    expect.assertions(7)

    const { loginResponse } = await loginRandomUser(app)
    const getMembersResponse = await request(app)
      .get(`/v2/api/member/${network}/locks/${lockAddress}/members`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
      .query({
        query: '',
        filterKey: 'owner',
        expiration: 'active',
      })

    expect(getMembersResponse.status).toBe(200)

    expect(Array.isArray(getMembersResponse.body)).toStrictEqual(true)
    const [firstItem] = getMembersResponse.body ?? []
    expect(firstItem).toHaveProperty('token')
    expect(firstItem).toHaveProperty('lockName')
    expect(firstItem).toHaveProperty('expiration')
    expect(firstItem).toHaveProperty('keyholderAddress')
    expect(firstItem).toHaveProperty('lockAddress')
  })

  it('should search by empty query and get all results', async () => {
    expect.assertions(3)

    const { loginResponse } = await loginRandomUser(app)
    const getMembersResponse = await request(app)
      .get(`/v2/api/member/${network}/locks/${lockAddress}/members`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
      .query({
        query: '',
        filterKey: 'owner',
        expiration: 'all',
      })

    expect(getMembersResponse.status).toBe(200)

    expect(Array.isArray(getMembersResponse.body)).toStrictEqual(true)
    expect(getMembersResponse.body.length).not.toBe(0)
  })

  it('should search by random query and not have results', async () => {
    expect.assertions(2)

    const { loginResponse } = await loginRandomUser(app)
    const getMembersResponse = await request(app)
      .get(`/v2/api/member/${network}/locks/${lockAddress}/members`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
      .query({
        query: 'NOT_VALID',
        filterKey: 'owner',
        expiration: 'all',
      })

    expect(getMembersResponse.status).toBe(200)

    expect(getMembersResponse.body.length).toStrictEqual(0)
  })

  it('should search by empty email query and get all results', async () => {
    expect.assertions(2)

    const { loginResponse } = await loginRandomUser(app)
    const getMembersResponse = await request(app)
      .get(`/v2/api/member/${network}/locks/${lockAddress}/members`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
      .query({
        query: '',
        filterKey: 'email',
        expiration: 'all',
      })

    expect(getMembersResponse.status).toBe(200)

    expect(getMembersResponse.body.length).not.toStrictEqual(0)
  })

  it('should search by empty keyId query and get all results', async () => {
    expect.assertions(2)

    const { loginResponse } = await loginRandomUser(app)
    const getMembersResponse = await request(app)
      .get(`/v2/api/member/${network}/locks/${lockAddress}/members`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
      .query({
        query: '',
        filterKey: 'keyId',
        expiration: 'all',
      })

    expect(getMembersResponse.status).toBe(200)

    expect(getMembersResponse.body.length).not.toStrictEqual(0)
  })

  it('it search by specific keyId query', async () => {
    expect.assertions(3)

    const { loginResponse } = await loginRandomUser(app)
    const getMembersResponse = await request(app)
      .get(`/v2/api/member/${network}/locks/${lockAddress}/members`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
      .query({
        query: '4',
        filterKey: 'keyId',
        expiration: 'all',
      })

    const [data] = getMembersResponse.body
    expect(getMembersResponse.status).toBe(200)
    expect(getMembersResponse.body.length).toStrictEqual(1)
    expect(data.token).toStrictEqual('4')
  })
})
