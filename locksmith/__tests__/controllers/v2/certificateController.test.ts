import request from 'supertest'
import { loginRandomUser } from '../../test-helpers/utils'
import app from '../../app'
import { vi, describe, expect } from 'vitest'

const lockAddress = '0x3F09aD349a693bB62a162ff2ff3e097bD1cE9a8C'
const wrongLockAddress = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
const network = 10
const tokenId = 147
const wrongTokenId = '666'
const owner = `0x00192fb10df37c9fb26829eb2cc623cd1bf599e8`

vi.mock('@unlock-protocol/unlock-js', () => {
  return {
    Web3Service: vi.fn().mockImplementation(() => {
      return {
        ownerOf: (_lockAddress: string, id: string, _network: number) => owner,
        isLockManager: (lock: string) => lockAddress === lock,
      }
    }),
  }
})

describe('certification endpoints', () => {
  it('returns an error when authentication is missing', async () => {
    expect.assertions(1)

    const response = await request(app).get(
      `/v2/certificate/${network}/lock/${lockAddress}/key/${tokenId}/generate`
    )
    expect(response.status).toBe(401)
  })

  it('returns an error when authentication is there but the user is not lock manager', async () => {
    expect.assertions(2)

    const { loginResponse } = await loginRandomUser(app)
    expect(loginResponse.status).toBe(200)

    const response = await request(app)
      .get(
        `/v2/certificate/${network}/lock/${wrongLockAddress}/key/${tokenId}/generate`
      )
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)

    expect(response.status).toBe(403)
  })

  it('returns an error when authentication is there but the user is not the owner', async () => {
    expect.assertions(2)

    const { loginResponse } = await loginRandomUser(app)
    expect(loginResponse.status).toBe(200)

    const response = await request(app)
      .get(
        `/v2/certificate/${network}/lock/${wrongLockAddress}/key/${wrongTokenId}/generate`
      )
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)

    expect(response.status).toBe(403)
  })
})
