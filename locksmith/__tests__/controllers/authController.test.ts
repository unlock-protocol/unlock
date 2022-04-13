import request from 'supertest'
import { ethers } from 'ethers'
import { SiweMessage, generateNonce } from 'siwe'

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

  it('returns the right user address from the code that the front-end yield', async () => {
    expect.assertions(2)
    const client_id = 'ouvre-boite.com'

    // This was generated in the front-end application, to make sure we keep compatibility
    const code =
      'eyJkIjoid3d3Lm91dnJlLWJvaXRlLmNvbSB3YW50cyB5b3UgdG8gc2lnbiBpbiB3aXRoIHlvdXIgRXRoZXJldW0gYWNjb3VudDpcbjB4OEVhOWE2ZmVCMGU5MkFBRUViMGVBOGE3NzljOTFCMGJjNWRFMUFkN1xuXG5cblVSSTogaHR0cHM6Ly9hcHAudW5sb2NrLXByb3RvY29sLmNvbS9sb2dpblxuVmVyc2lvbjogMVxuQ2hhaW4gSUQ6IDRcbk5vbmNlOiBnTTRXemFkeDVHYUh1MVJCbVxuSXNzdWVkIEF0OiAyMDIyLTA0LTEzVDEwOjIxOjAwLjg2N1pcbkV4cGlyYXRpb24gVGltZTogMjAyMi0wNC0yMFQxMDoyMTowMC44NjdaIiwicyI6IjB4YTc4MmNlNDY4ODNhNmQ3ZDQxZWQxMGIxZDY5MmE1OGIwZTFiNzBjZTk4YWIyZTNhYWI4MDJhY2YwZmI1MDgzNjc2OGUxZDYyZTk4YmJiODgxY2NlNDgxMDZkZjIxMDhhNzc3M2FmODllODgyZDQ5ZTkwNTgwODBjN2I5ZjVjYTYxYiJ9'

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
    expect(response.body.me).toBe('0x8Ea9a6feB0e92AAEEb0eA8a779c91B0bc5dE1Ad7')
  })
})
