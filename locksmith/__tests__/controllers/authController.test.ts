import request from 'supertest'
import { ethers } from 'ethers'
import { generateNonce, SiweMessage } from 'siwe'

const app = require('../../src/app')

describe('Auth Endpoint', () => {
  it('returns an error if redirect_uri is missing', async () => {
    expect.assertions(1)
    const response = await request(app)
      .post('/api/oauth')
      .set('Accept', 'json')
      .send({
        client_id: 'ouvre-boite.com',
        grant_type: 'authorization_code',
        code: 'code',
      })

    expect(response.status).toBe(400)
  })

  it('returns an error if client_id is missing', async () => {
    expect.assertions(1)
    const response = await request(app)
      .post('/api/oauth')
      .set('Accept', 'json')
      .send({
        redirect_uri: 'https://ouvre-boite.com',
        grant_type: 'authorization_code',
        code: 'code',
      })

    expect(response.status).toBe(400)
  })

  it('returns an error if grant_type is not authorization_code', async () => {
    expect.assertions(1)
    const response = await request(app)
      .post('/api/oauth')
      .set('Accept', 'json')
      .send({
        redirect_uri: 'https://ouvre-boite.com',
        client_id: 'ouvre-boite.com',
        grant_type: 'nope',
        code: 'code',
      })

    expect(response.status).toBe(400)
  })

  it('returns an error if code is missing', async () => {
    expect.assertions(1)
    const response = await request(app)
      .post('/api/oauth')
      .set('Accept', 'json')
      .send({
        redirect_uri: 'https://ouvre-boite.com',
        client_id: 'ouvre-boite.com',
        grant_type: 'authorization_code',
      })

    expect(response.status).toBe(400)
  })

  it('returns an error if the redirect_uri does not match the client_id', async () => {
    expect.assertions(1)
    const response = await request(app)
      .post('/api/oauth')
      .set('Accept', 'json')
      .send({
        redirect_uri: 'https://ouvre-boite.com',
        client_id: 'apple.com',
        grant_type: 'authorization_code',
        code: 'code',
      })

    expect(response.status).toBe(400)
  })

  it('returns the user address from the hashed message', async () => {
    expect.assertions(2)
    const client_id = 'ouvre-boite.com'
    const signer = ethers.Wallet.createRandom()
    const address = await signer.getAddress()
    const nonce = generateNonce()
    const message = new SiweMessage({
      domain: client_id,
      address,
      nonce,
      chainId: 1,
      version: '1',
      statement: '',
      uri: 'https://app.unlock-protocol.com/login',
    })

    const digest = message.prepareMessage()

    // Get the signature
    const signature = await signer.signMessage(digest)

    const code = Buffer.from(
      JSON.stringify({
        d: digest,
        s: signature,
      })
    ).toString('base64')

    const response = await request(app)
      .post('/api/oauth')
      .set('Accept', 'json')
      .send({
        redirect_uri: `https://${client_id}`,
        client_id: client_id,
        grant_type: 'authorization_code',
        code,
      })

    expect(response.status).toBe(200)
    expect(response.body.me).toBe(address)
  })
})
