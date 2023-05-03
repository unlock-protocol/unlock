import { ethers, Wallet } from 'ethers'

// default mnemonic from hardhat
const mnemonic = 'test test test test test test test test test test test junk'
const derivationPath = "m/44'/60'/0'/0"
const rpcUrl = 'http://127.0.0.1:8545'

export const getHardhatProvider = async () => {
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
  return provider
}

export const resetNode = async () => {
  const provider = await getHardhatProvider()
  await provider.send('hardhat_reset')
}

export const addSomeETH = async (
  address,
  amount = ethers.utils.parseEther('1000')
) => {
  const balance = ethers.utils.hexStripZeros(amount)
  const provider = await getHardhatProvider()
  await provider.send('hardhat_setBalance', [address, balance])
}

/**
 * This function transfers amount Eth to the recipient.
 * @param {*} provider
 * @param {*} recipients
 */
export const transferETH = async function (
  signer,
  recipient,
  amount = ethers.utils.parseEther('1')
) {
  const transaction = await signer.sendTransaction({
    to: recipient,
    value: ethers.utils.parseEther(amount),
  })
  return await transaction.wait()
}

export const getSigners = async (amount = 10) => {
  const provider = await getHardhatProvider()
  const signers = [...Array(amount).keys()].map((i) =>
    new Wallet.fromMnemonic(mnemonic, `${derivationPath}/${i}`).connect(
      provider
    )
  )
  return signers
}
