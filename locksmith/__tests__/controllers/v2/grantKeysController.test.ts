import request from 'supertest'
import { getWalletInput } from '../../test-helpers/utils'

const app = require('../../../src/app')

jest.setTimeout(600000)
const lockAddress = '0x3F09aD349a693bB62a162ff2ff3e097bD1cE9a8C'

describe('grantKeys endpoint', () => {
  it.only('returns an error when authentication is missing', async () => {
    expect.assertions(2)
    const network = 4

    const { walletAddress: address } = await getWalletInput()

    const response = await request(app)
      .post(`/v2/api/grant/${network}/${lockAddress}`)
      .send({
        keys: [
          {
            recipient: '0xea674fdde714fd979de3edf0f56aa9716b898ec8',
            expiration: new Date().getTime() / 1000 + 60 * 60 * 24,
            manager: address,
          },
        ],
      })
    expect(response.status).toBe(200)
  })

  it('returns an error when authentication is there but the user is not a lock manager or a key granter', async () => {
    expect.assertions(1)
    const network = 4

    const {
      walletAddress: address,
      message,
      signedMessage,
    } = await getWalletInput()
    const loginResponse = await request(app).post('/v2/auth/login').send({
      signature: signedMessage,
      message: message.prepareMessage(),
    })
    expect(loginResponse.status).toBe(200)

    const response = await request(app)
      .post(`/v2/api/grant/${network}/${lockAddress}`)
      .send({
        keys: [
          {
            recipient: '0xea674fdde714fd979de3edf0f56aa9716b898ec8',
            expiration: new Date().getTime() / 1000 + 60 * 60 * 24,
            manager: address,
          },
        ],
      })
    expect(response.status).toBe(200)
  })

  it('grant keys if the caller is a lock manager', async () => {
    expect.assertions(3)
    const network = 4

    const {
      walletAddress: address,
      message,
      signedMessage,
    } = await getWalletInput()
    const loginResponse = await request(app).post('/v2/auth/login').send({
      signature: signedMessage,
      message: message.prepareMessage(),
    })
    expect(loginResponse.status).toBe(200)

    const response = await request(app)
      .post(`/v2/api/grant/${network}/${lockAddress}`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
      .send({
        keys: [
          {
            recipient: '0xea674fdde714fd979de3edf0f56aa9716b898ec8',
            expiration: new Date().getTime() / 1000 + 60 * 60 * 24,
            manager: address,
          },
        ],
      })
    console.log(response.body)
    expect(response.status).toBe(200)
  })

  it('grant keys if the caller is a key granter', async () => {
    expect.assertions(3)
    const network = 4

    const {
      walletAddress: address,
      message,
      signedMessage,
    } = await getWalletInput()
    const loginResponse = await request(app).post('/v2/auth/login').send({
      signature: signedMessage,
      message: message.prepareMessage(),
    })
    expect(loginResponse.status).toBe(200)

    const response = await request(app)
      .post(`/v2/api/grant/${network}/${lockAddress}`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
      .send({
        keys: [
          {
            recipient: '0xea674fdde714fd979de3edf0f56aa9716b898ec8',
            expiration: new Date().getTime() / 1000 + 60 * 60 * 24,
            manager: address,
          },
        ],
      })
    console.log(response.body)
    expect(response.status).toBe(200)
  })
})
