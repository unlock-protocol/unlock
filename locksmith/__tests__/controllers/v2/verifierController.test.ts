import { ethers } from 'ethers'
import request from 'supertest'
import { getWalletInput } from '../../test-helpers/utils'

const app = require('../../../src/app')

jest.setTimeout(600000)

const lockAddress = '0x3F09aD349a693bB62a162ff2ff3e097bD1cE9a8C'
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

describe('Verifier v2 endpoints for locksmith', () => {
  it('Get list items without authorization', async () => {
    expect.assertions(1)
    const lock = await ethers.Wallet.createRandom().getAddress()
    const getListEndpoint = await request(app).get(
      `/v2/api/verifier/${network}/${lock}`
    )
    expect(getListEndpoint.status).toBe(403)
  })

  it('Get list items from lock with random address (not lockManager)', async () => {
    expect.assertions(2)
    const lock = await ethers.Wallet.createRandom().getAddress()
    const { message, signedMessage } = await getWalletInput()
    const loginResponse = await request(app).post('/v2/auth/login').send({
      signature: signedMessage,
      message: message.prepareMessage(),
    })
    expect(loginResponse.status).toBe(200)

    const getListResponse = await request(app)
      .get(`/v2/api/verifier/list/${network}/${lock}`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)

    expect(getListResponse.status).toBe(401)
  })

  it('Add add verifier and delete correctly', async () => {
    expect.assertions(3)

    const { signedMessage, message } = await getWalletInput()

    const loginResponse = await request(app).post('/v2/auth/login').send({
      signature: signedMessage,
      message: message.prepareMessage(),
    })

    const randomWallet = await ethers.Wallet.createRandom().getAddress()
    expect(loginResponse.status).toBe(200)

    const addVerifierResponse = await request(app)
      .put(`/v2/api/verifier/${network}/${lockAddress}/${randomWallet}`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)

    expect(addVerifierResponse.status).toBe(201)

    const deleteVerifierResponse = await request(app)
      .delete(`/v2/api/verifier/${network}/${lockAddress}/${randomWallet}`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)

    expect(deleteVerifierResponse.status).toBe(200)
  })

  it('Get verifiers list', async () => {
    expect.assertions(3)

    const { signedMessage, message } = await getWalletInput()

    const loginResponse = await request(app).post('/v2/auth/login').send({
      signature: signedMessage,
      message: message.prepareMessage(),
    })

    expect(loginResponse.status).toBe(200)

    const getVerifierListResponse = await request(app)
      .get(`/v2/api/verifier/list/${network}/${lockAddress}`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)

    expect(getVerifierListResponse.status).toBe(200)
    expect(Array.isArray(getVerifierListResponse.body.results)).toStrictEqual(
      true
    )
  })
})
