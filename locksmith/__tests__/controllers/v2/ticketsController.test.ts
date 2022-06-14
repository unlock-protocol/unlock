import request from 'supertest'
import { loginRandomUser } from '../../test-helpers/utils'

const app = require('../../../src/app')

jest.setTimeout(600000)
const lockAddress = '0x3F09aD349a693bB62a162ff2ff3e097bD1cE9a8C'
const network = 4
const tokenId = '123'
const wrongTokenId = '666'
let owner = `0x00192fb10df37c9fb26829eb2cc623cd1bf599e8`

jest.mock('@unlock-protocol/unlock-js', () => {
  return {
    Web3Service: jest.fn().mockImplementation(() => {
      return {
        ownerOf: (_lockAddress: string, _tokenId: string, _network: number) =>
          owner,
      }
    }),
  }
})

describe('sign endpoint', () => {
  it('returns an error when authentication is missing', async () => {
    expect.assertions(1)

    const response = await request(app).get(
      `/v2/api/ticket/${network}/${lockAddress}/${tokenId}/sign`
    )
    expect(response.status).toBe(403)
  })

  it('returns an error when authentication is there but the user is not the key owner', async () => {
    expect.assertions(2)

    const { loginResponse } = await loginRandomUser(app)
    expect(loginResponse.status).toBe(200)

    const response = await request(app)
      .get(`/v2/api/ticket/${network}/${lockAddress}/${wrongTokenId}/sign`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)

    expect(response.status).toBe(401)
  })

  it('returns the signed message if the owner is the sender of the transaction', async () => {
    expect.assertions(9)

    const { loginResponse, address } = await loginRandomUser(app)
    owner = address
    expect(loginResponse.status).toBe(200)

    const response = await request(app)
      .get(`/v2/api/ticket/${network}/${lockAddress}/${tokenId}/sign`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
    const payload = JSON.parse(response.body.payload)
    expect(payload.network).toBe(network)
    expect(payload.account).toBe(address)
    expect(payload.lockAddress).toBe(lockAddress)
    expect(payload.tokenId).toBe(tokenId)
    const now = new Date().getTime()
    expect(payload.timestamp).toBeGreaterThan(now - 10000) // at most 10 seconds ago
    expect(payload.timestamp).toBeLessThan(now)
    expect(typeof response.body.signature).toBe('string')
    expect(response.status).toBe(200)
  })
})
