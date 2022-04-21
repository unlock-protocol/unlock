/* eslint-disable no-await-in-loop */
const ethers = require('ethers')
const networks = require('@unlock-protocol/networks')
const { WalletService, Web3Service } = require('../dist/index.js')

const grantKeys = async (networkId, lockAddress, rawRecipients) => {
  const network = networks.networks[networkId]
  if (!network) {
    throw new Error(`Network ${networkId} not supported.`)
  }
  if (!process.env.PRIVATE_KEY) {
    throw new Error('Please set a PRIVATE_KEY environment variable')
  }

  const provider = new ethers.providers.JsonRpcProvider(network.publicProvider)
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY)

  const signer = wallet.connect(provider)
  const walletService = new WalletService(networks.default)
  const web3Service = new Web3Service(networks.default)

  const lock = await web3Service.getLock(lockAddress, networkId)

  const isKeyGranter = await web3Service.isKeyGranter(
    lockAddress,
    signer.address,
    networkId
  )

  const isLockManager = await web3Service.isLockManager(
    lockAddress,
    signer.address,
    networkId
  )
  if (!isKeyGranter && !isLockManager) {
    throw new Error(`${signer.address} is not a lock manager or a key granter`)
  }

  const recipients = []
  const expirations = []
  const managers = []

  const now = Math.floor(new Date().getTime() / 1000)
  let defaultExpiration = ethers.constants.MaxUint256
  if (lock.expirationDuration < ethers.constants.MaxUint256) {
    defaultExpiration = now + lock.expirationDuration
  }
  for (let i = 0; i < rawRecipients.length; i++) {
    try {
      const [recipient, expiration, manager] = rawRecipients[i].split(',')

      const address = await new ethers.providers.JsonRpcProvider(
        networks.mainnet.publicProvider
      ).resolveName(recipient)

      recipients.push(address)

      // No expiration? Use the default
      if (expiration) {
        expirations.push(expiration)
      } else {
        expirations.push(defaultExpiration)
      }

      // No manager? Use the granter's address
      if (manager) {
        managers.push(manager)
      } else {
        managers.push(wallet.address)
      }
    } catch (error) {
      console.error(error)
    }
  }

  // Connect to a provider with a signer
  await walletService.connect(provider, signer)
  const tokenIds = await walletService.grantKeys(
    {
      lockAddress,
      recipients,
      expirations,
      managers,
    },
    (error, hash) => {
      if (error) {
        throw error
      }
      console.log('Transaction sent', hash)
    }
  )
  console.log('Keys granted', tokenIds)
}

const run = () => {
  const [, , network, lockAddress, ...recipients] = process.argv
  if (!network) {
    throw new Error('Missing network')
  }
  if (!lockAddress) {
    throw new Error('Missing lockAddress')
  }
  if (!recipients) {
    throw new Error('Missing recipients')
  }
  grantKeys(parseInt(network, 10), lockAddress, recipients)
}

run()
