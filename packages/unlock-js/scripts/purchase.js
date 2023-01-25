/* eslint-disable no-await-in-loop */
const ethers = require('ethers')
const networks = require('@unlock-protocol/networks')
const { WalletService, Web3Service } = require('../dist/index.js')

const purchase = async (networkId, lockAddress) => {
  const network = networks.networks[networkId]
  if (!network) {
    throw new Error(`Network ${networkId} not supported.`)
  }
  if (!process.env.PRIVATE_KEY) {
    throw new Error('Please set a PRIVATE_KEY environment variable')
  }

  const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545')
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY)

  const signer = wallet.connect(provider)
  const walletService = new WalletService(networks.default)
  const web3Service = new Web3Service(networks.default)

  const lock = await web3Service.getLock(lockAddress, networkId)

  // Connect to a provider with a signer
  await walletService.connect(provider, signer)
  console.log('I WAS HERE!')
  console.log(lock)
  const tokenId = await walletService.purchaseKey(
    {
      lockAddress,
      referrer: '0x49bc4c7e7ddb900f2cc1176cdf300d78194fa1e8'
    },
    {},
    (error, hash) => {
      if (error) {
        throw error
      }
      console.log('Transaction sent', hash)
    }
  )
  console.log('Key purchased', tokenId)
}

const run = () => {
  purchase(5, '0x49bc4c7e7ddb900f2cc1176cdf300d78194fa1e8')
}

run()
