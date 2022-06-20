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

describe('genetate qrcode endpoint', () => {
  it('returns an error when authentication is missing', async () => {
    expect.assertions(1)

    const response = await request(app).get(
      `/v2/api/qrcode/${network}/${lockAddress}/${tokenId}/generate`
    )
    expect(response.status).toBe(403)
  })

  it('returns an error when authentication is there but the user is not the key owner', async () => {
    expect.assertions(2)

    const { loginResponse } = await loginRandomUser(app)
    expect(loginResponse.status).toBe(200)

    const response = await request(app)
      .get(`/v2/api/qrcode/${network}/${lockAddress}/${wrongTokenId}/generate`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)

    expect(response.status).toBe(401)
  })

  it('returns qrcode url if the owner is the sender of the transaction', async () => {
    expect.assertions(3)

    const { loginResponse, address } = await loginRandomUser(app)
    owner = address
    expect(loginResponse.status).toBe(200)

    const response = await request(app)
      .get(`/v2/api/qrcode/${network}/${lockAddress}/${tokenId}/generate`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
    console.log('response', response.body)
    expect(response.body.url).not.toBeUndefined()
    expect(response.status).toBe(200)
  })
})
