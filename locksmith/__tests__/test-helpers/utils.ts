import { generateNonce, SiweMessage } from 'siwe'
import { ethers } from 'ethers'

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
