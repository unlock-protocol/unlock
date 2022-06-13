import { generateNonce, SiweMessage } from 'siwe'
import { ethers } from 'ethers'
import request from 'supertest'

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function getWalletInput() {
  const wallet = ethers.Wallet.createRandom()
  const walletAddress = await wallet.getAddress()
  const nonce = generateNonce()
  const message = new SiweMessage({
    domain: 'locksmith.com',
    nonce,
    chainId: 4,
    uri: 'https://locksmith.unlock-protocol.com',
    version: '1',
    statement: 'Authorize',
    address: walletAddress,
  })

  const signedMessage = await wallet.signMessage(message.prepareMessage())

  return {
    signedMessage,
    message,
    wallet,
    walletAddress,
    nonce,
  }
}

/**
 * Helper to log users in
 * @param app
 * @returns
 */
export async function loginRandomUser(app: any) {
  const {
    walletAddress: address,
    message,
    signedMessage,
  } = await getWalletInput()
  const loginResponse = await request(app).post('/v2/auth/login').send({
    signature: signedMessage,
    message: message.prepareMessage(),
  })
  return {
    address,
    loginResponse,
  }
}

export async function loginAsApplication(app: any, name: string) {
  const { address, loginResponse } = await loginRandomUser(app)
  const applicationResponse = await request(app)
    .post('/v2/applications')
    .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
    .send({
      name,
    })

  return {
    address,
    application: applicationResponse.body,
    loginResponse,
  }
}
