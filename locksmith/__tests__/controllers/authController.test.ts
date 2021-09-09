import request from 'supertest'
import { ethers } from 'ethers'

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
    const digest = `Connecting to ${client_id}`

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

  it('returns the right user address from the code that the front-end yield', async () => {
    expect.assertions(2)
    const client_id = 'ouvre-boite.com'

    // This was generated in the front-end application, to make sure we keep compatibility
    const code =
      'eyJkIjoiQ29ubmVjdGluZyBteSBhY2Njb3VudCB0byBvdXZyZS1ib2l0ZS5jb20uIiwicyI6IjB4NjNjOTg3ZDdkMTk3M2E3ZmYyZDMyY2FlNjM3ZWFlNTFmNTBlNTdiMmIwYWRjNjk5NjdkZTA3MjAyYjMxNzIwNzNjNzdhYjZhYjZiZDJkZmJjM2E0ZDUyMDlmN2E2ZWYxNTcxNjljNDRmNTk5MDQ4NmY5YjkzZDUzMDNmM2E1M2ExYyJ9'

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
    expect(response.body.me).toBe('0xDD8e2548da5A992A63aE5520C6bC92c37a2Bcc44')
  })
})
