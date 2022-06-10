import { ethers } from 'ethers'
import { generateNonce, SiweMessage } from 'siwe'
import request from 'supertest'
import { getWalletInput } from '../../test-helpers/utils'

const app = require('../../../src/app')

jest.setTimeout(600000)

const lockAddress = '0xcc04a8E25B712EBbdAD337dfDb59a154Bd6bbd06'
const privateKey =
  'a78e7b5e88c33dc1eebd200f37bae00d49059f76adbfeacdadb02d118a3d7f39'
describe('Verifier v2 endpoints for locksmith', () => {
  it('Get list items without authorization', async () => {
    expect.assertions(1)
    const network = 80001

    const getListEndpoint = await request(app).get(
      `/v2/api/verifier/${network}/${lockAddress}`
    )
    expect(getListEndpoint.status).toBe(403)
  })

  it('Get list items from lock with random address (not lockManager)', async () => {
    expect.assertions(2)
    const network = 80001

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
    const network = 80001

    const wallet = new ethers.Wallet(privateKey)
    const walletAddress = await wallet.getAddress()
    const nonce = generateNonce()
    const message = new SiweMessage({
      domain: 'locksmith.com',
      nonce,
      chainId: network,
      uri: 'https://locksmith.unlock-protocol.com',
      version: '1',
      statement: 'Authorize',
      address: walletAddress,
    })

    const signedMessage = await wallet.signMessage(message.prepareMessage())

    const loginResponse = await request(app).post('/v2/auth/login').send({
      signature: signedMessage,
      message: message.prepareMessage(),
    })

    const walletToAdd = ethers.Wallet.createRandom().getAddress()
    expect(loginResponse.status).toBe(200)

    const addVerifierResponse = await request(app)
      .put(`/v2/api/verifier/${network}/${lockAddress}/${walletToAdd}`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)

    expect(addVerifierResponse.status).toBe(201)

    const deleteVerifierResponse = await request(app)
      .delete(`/v2/api/verifier/${network}/${lockAddress}/${walletToAdd}`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)

    expect(deleteVerifierResponse.status).toBe(200)
  })
})
