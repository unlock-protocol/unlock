import request from 'supertest'
import { getWalletInput } from '../../test-helpers/utils'

const app = require('../../../src/app')

jest.setTimeout(600000)
const lockAddress = '0x3F09aD349a693bB62a162ff2ff3e097bD1cE9a8C'

describe('Verifier v2 endpoints for locksmith', () => {
  it('Add verifier to list and not add duplicates', async () => {
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

    const addVerifierResponse = await request(app)
      .put(`/v2/api/verifier/${network}/${lockAddress}/${address}`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)

    expect(addVerifierResponse.status).toBe(201)

    const addVerifierResponseDuplicate = await request(app)
      .put(`/v2/api/verifier/${network}/${lockAddress}/${address}`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
    expect(addVerifierResponseDuplicate.status).toBe(409)
  })

  it('Add verifier with error', async () => {
    expect.assertions(2)
    const network = null

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

    const addVerifierResponse = await request(app)
      .put(`/v2/api/verifier/${network}/${lockAddress}/${address}`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)

    expect(addVerifierResponse.status).toBe(500)
  })

  it('Add add verifier and delete correctly', async () => {
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

    const addVerifierResponse = await request(app)
      .put(`/v2/api/verifier/${network}/${lockAddress}/${address}`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)

    expect(addVerifierResponse.status).toBe(201)

    const deleteVerifierResponse = await request(app)
      .delete(`/v2/api/verifier/${network}/${lockAddress}/${address}`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)

    expect(deleteVerifierResponse.status).toBe(200)
  })

  it('Check is verifiers is enabled', async () => {
    expect.assertions(2)
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

    const isVerifierResponse = await request(app)
      .get(`/v2/api/verifier/enabled/${network}/${lockAddress}/${address}`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)

    expect(isVerifierResponse.status).toBe(200)
  })
})
