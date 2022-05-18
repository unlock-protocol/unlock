import { ethers } from 'ethers'
import request from 'supertest'

const app = require('../../../src/app')

jest.setTimeout(600000)
const lockAddress = '0x3F09aD349a693bB62a162ff2ff3e097bD1cE9a8C'

describe('Verifier v2 endpoints for locksmith', () => {
  it('Add verifier to list and not add duplicates', async () => {
    expect.assertions(2)
    const address = await ethers.Wallet.createRandom().getAddress()
    const network = 4

    const addVerifierResponse = await request(app).put(
      `/v2/api/verifier/${network}/${lockAddress}/${address}`
    )

    expect(addVerifierResponse.status).toBe(200)

    const addVerifierResponseDuplicate = await request(app).put(
      `/v2/api/verifier/${network}/${lockAddress}/${address}`
    )
    expect(addVerifierResponseDuplicate.status).toBe(409)
  })

  it('Add verifier with error', async () => {
    expect.assertions(1)
    const address = await ethers.Wallet.createRandom().getAddress()
    const network = null

    const addVerifierResponse = await request(app).put(
      `/v2/api/verifier/${network}/${lockAddress}/${address}`
    )

    expect(addVerifierResponse.status).toBe(500)
  })

  it('Get verifiers list', async () => {
    expect.assertions(1)
    const network = 4

    const verifierListResponse = await request(app).get(
      `/v2/api/verifier/list/${network}/${lockAddress}`
    )

    expect(verifierListResponse.status).toBe(200)
  })

  it('Add add verifier and delete correctly', async () => {
    expect.assertions(2)
    const address = await ethers.Wallet.createRandom().getAddress()
    const network = 4

    const addVerifierResponse = await request(app).put(
      `/v2/api/verifier/${network}/${lockAddress}/${address}`
    )

    expect(addVerifierResponse.status).toBe(200)

    const deleteVerifierResponse = await request(app).delete(
      `/v2/api/verifier/${network}/${lockAddress}/${address}`
    )

    expect(deleteVerifierResponse.status).toBe(200)
  })
})
