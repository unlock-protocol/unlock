import { ethers, Wallet } from 'ethers'

// TODO: same mnemonic as hardhat
const mnemonic = ''
const rpcUrl = 'http://localhost:8020'

export const getHardhatProvider = async () => {
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
  return provider
}

export const getSigners = async () => {
  const provider = await getHardhatProvider()
  const wallet = new Wallet.fromMnemonic(mnemonic)
  const accounts = await provider.listAccounts()
  const signer = wallet.connect(provider)
}
