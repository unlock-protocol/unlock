import request from 'supertest'
import { loginRandomUser } from '../../test-helpers/utils'

const app = require('../../../src/app')

jest.setTimeout(600000)

const lockAddress = '0x4D35Fb10150E3D5E09ce332bBc4366D9F89B49c5'
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
  it('Get members without authorization', async () => {
    expect.assertions(1)
    const getListResponse = await request(app).get(
      `/v2/api/member/${network}/locks/${lockAddress}/list`
    )
    expect(getListResponse.status).toBe(403)
  })

  it('Get members without filter query throw error', async () => {
    expect.assertions(2)
    const { loginResponse } = await loginRandomUser(app)
    expect(loginResponse.status).toBe(200)

    const getListResponse = await request(app)
      .get(`/v2/api/member/${network}/locks/${lockAddress}/list`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)

    expect(getListResponse.status).toBe(404)
  })

  it('Get members list with filtred query', async () => {
    expect.assertions(7)

    const { loginResponse } = await loginRandomUser(app)
    const getVerifierListResponse = await request(app)
      .get(`/v2/api/member/${network}/locks/${lockAddress}/list`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
      .query({
        filters: JSON.stringify({
          query: '',
          filterKey: 'owner',
          expiration: 'active',
        }),
      })

    expect(getVerifierListResponse.status).toBe(200)

    expect(Array.isArray(getVerifierListResponse.body)).toStrictEqual(true)
    const [firstItem] = getVerifierListResponse.body ?? []
    expect(firstItem).toHaveProperty('token')
    expect(firstItem).toHaveProperty('lockName')
    expect(firstItem).toHaveProperty('expiration')
    expect(firstItem).toHaveProperty('keyholderAddress')
    expect(firstItem).toHaveProperty('lockAddress')
  })
})
