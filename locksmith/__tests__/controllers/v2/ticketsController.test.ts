import request from 'supertest'
import { loginRandomUser } from '../../test-helpers/utils'
const metadataOperations = require('../../../src/operations/metadataOperations')

const app = require('../../../src/app')

jest.setTimeout(600000)
const lockAddress = '0x3F09aD349a693bB62a162ff2ff3e097bD1cE9a8C'
const wrongLockAddress = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
const network = 4
const tokenId = '2244'
const wrongTokenId = '666'
let owner = `0x00192fb10df37c9fb26829eb2cc623cd1bf599e8`

jest.mock('@unlock-protocol/unlock-js', () => {
  return {
    Web3Service: jest.fn().mockImplementation(() => {
      return {
        ownerOf: (_lockAddress: string, _tokenId: string, _network: number) =>
          owner,
        isLockManager: (lock: string) => lockAddress === lock,
      }
    }),
  }
})

jest.mock('../../../src/operations/wedlocksOperations', () => {
  return {
    notifyNewKeyToWedlocks: (key: string, networkId?: number) =>
      tokenId === key && network === networkId,
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

  it('does not mark the ticket as checked-in when authentication is missing and returns an error', async () => {
    expect.assertions(1)
    const response = await request(app).put(
      `/v2/api/ticket/${network}/lock/${lockAddress}/key/${tokenId}/check`
    )

    expect(response.status).toBe(403)
  })

  it('marks ticket as checked-in fails when user is not a verifier', async () => {
    expect.assertions(2)
    const { loginResponse } = await loginRandomUser(app)
    expect(loginResponse.status).toBe(200)

    const response = await request(app)
      .put(
        `/v2/api/ticket/${network}/lock/${wrongLockAddress}/key/${tokenId}/check`
      )
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)

    expect(response.status).toBe(403)
  })

  it('marks ticket as checked-in succeed when user is a verifier', async () => {
    expect.assertions(2)
    const { loginResponse } = await loginRandomUser(app)
    expect(loginResponse.status).toBe(200)

    const response = await request(app)
      .put(`/v2/api/ticket/${network}/lock/${lockAddress}/key/${tokenId}/check`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)

    expect(response.status).toBe(202)
  })

  it('correctly marks ticket as checked-in and set key data', async () => {
    expect.assertions(5)
    const { loginResponse } = await loginRandomUser(app)
    expect(loginResponse.status).toBe(200)

    const response = await request(app)
      .put(`/v2/api/ticket/${network}/lock/${lockAddress}/key/${tokenId}/check`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)

    expect(response.status).toBe(202)

    const keyData = await metadataOperations.getKeyCentricData(
      lockAddress,
      tokenId
    )
    expect(keyData.metadata.checkedInAt).not.toBeUndefined()
    expect(keyData.lockAddress).toBe(lockAddress)
    expect(keyData.keyId).toBe(tokenId)
  })

  it('does not override metadata', async () => {
    expect.assertions(4)
    const { loginResponse } = await loginRandomUser(app)
    expect(loginResponse.status).toBe(200)

    const checkInTime = new Date().getTime()
    const metadata = {
      chain: network,
      address: lockAddress,
      id: tokenId,
      data: {
        keyId: tokenId,
        lockAddress,
        metadata: {
          checkedInAt: checkInTime,
          value: '12',
        },
        KeyMetadata: {
          custom_field: 'Random',
        },
      },
    }

    await metadataOperations.updateKeyMetadata(metadata)

    const response = await request(app)
      .put(`/v2/api/ticket/${network}/lock/${lockAddress}/key/${tokenId}/check`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
    expect(response.status).toBe(202)

    const keyData = await metadataOperations.getKeyCentricData(
      lockAddress,
      tokenId
    )

    expect(keyData.metadata.value).toBe('12')
    expect(keyData.KeyMetadata.custom_field).toBe('Random')
  })

  it('does not send email when auhentication is not present', async () => {
    expect.assertions(1)

    const response = await request(app).post(
      `/v2/api/ticket/${network}/${lockAddress}/${tokenId}/email`
    )
    expect(response.status).toBe(403)
  })

  it('does not send email when auhentication is present but the user is not the key manager', async () => {
    expect.assertions(2)

    const { loginResponse } = await loginRandomUser(app)
    expect(loginResponse.status).toBe(200)

    const response = await request(app)
      .post(`/v2/api/ticket/${network}/${wrongLockAddress}/${tokenId}/email`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)

    expect(response.status).toBe(401)
  })

  it('send email when user is athenticated and is the key manager', async () => {
    expect.assertions(2)

    const { loginResponse, address } = await loginRandomUser(app)
    owner = address
    expect(loginResponse.status).toBe(200)

    const response = await request(app)
      .post(`/v2/api/ticket/${network}/${lockAddress}/${tokenId}/email`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)

    expect(response.status).toBe(200)
  })
})
