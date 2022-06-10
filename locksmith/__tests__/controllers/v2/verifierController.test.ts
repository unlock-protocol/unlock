import { ethers } from 'ethers'
import request from 'supertest'
import { getWalletInput } from '../../test-helpers/utils'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const app = require('../../../src/app')

jest.setTimeout(600000)

const lockAddress = '0x3F09aD349a693bB62a162ff2ff3e097bD1cE9a8C'
const managedLock = '0xdCc44A9502239657578cB626C5afe9c2615733c0'
const network = 4
jest.mock('@unlock-protocol/unlock-js', () => {
  return {
    Web3Service: jest.fn().mockImplementation(() => {
      return {
        isLockManager: (lockAddress: string) => lockAddress === managedLock,
      }
    }),
  }
})

jest.mock('../../../src/controllers/v2/verifierController', () => {
  const mockDispatcher = {
    list: jest.fn((_req, res) =>
      res.status(200).send({
        results: [],
      })
    ),
    addVerifier: jest.fn(() => Promise.resolve()),
    removeVerifier: jest.fn(() => Promise.resolve()),
  }

  return jest.fn().mockImplementation(() => {
    return mockDispatcher
  })
})

jest.mock('../../../src/utils/lockManager', () => {
  return jest.fn().mockImplementation(() => {
    return {
      lockManagerMiddleware: async () => jest.fn(),
    }
  })
})

describe('Verifier v2 endpoints for locksmith', () => {
  it('Get list items without authorization', async () => {
    expect.assertions(1)

    const getListEndpoint = await request(app).get(
      `/v2/api/verifier/${network}/${lockAddress}`
    )
    expect(getListEndpoint.status).toBe(403)
  })

  it('Get list items from lock with random address (not lockManager)', async () => {
    expect.assertions(2)

    const { message, signedMessage } = await getWalletInput()
    const loginResponse = await request(app).post('/v2/auth/login').send({
      signature: signedMessage,
      message: message.prepareMessage(),
    })
    expect(loginResponse.status).toBe(200)

    const getListResponse = await request(app)
      .get(`/v2/api/verifier/list/${network}/${lockAddress}`)
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

    console.log('here', addVerifierResponse)
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
