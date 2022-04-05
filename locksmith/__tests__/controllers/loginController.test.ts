import request from 'supertest'
import { ethers } from 'ethers'
import { SiweMessage } from 'siwe'
import { sealData } from 'iron-session'
import { sessionOptions } from '../../src/utils/session'

const app = require('../../src/app')

describe('Auth login endpoints for locksmith', () => {
  it('Check if different nonce is issued', async () => {
    expect.assertions(3)
    const response = await request(app).get('/v2/auth/nonce')
    const response2 = await request(app).get('/v2/auth/nonce')
    expect(response.status).toBe(200)
    expect(response.text).not.toBeFalsy()
    expect(response.text).not.toBe(response2.text)
  })

  it('Check if message is accepted on login', async () => {
    expect.assertions(2)
    const wallet = ethers.Wallet.createRandom()

    const nonceResponse = await request(app).get('/v2/auth/nonce')
    const message = new SiweMessage({
      domain: 'locksmith.com',
      nonce: nonceResponse.text,
      chainId: 4,
      uri: 'https://locksmith.unlock-protocol.com',
      version: '1',
      statement: 'Authorize',
      address: await wallet.getAddress(),
    })

    const signedMessage = await wallet.signMessage(message.prepareMessage())

    const cookieValue = await sealData(
      {
        nonce: nonceResponse.text,
      },
      sessionOptions
    )

    const loginResponse = await request(app)
      .post('/v2/auth/login')
      .set('Cookie', [`locksmith=${cookieValue}`])
      .send({
        signature: signedMessage,
        message: message.prepareMessage(),
      })

    const fields = await message.validate(signedMessage)
    expect(loginResponse.body.address).toBe(fields.address)
    expect(loginResponse.status).toBe(200)
  })
})
