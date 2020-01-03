/* eslint-disable no-console */
const net = require('net')
const ethers = require('ethers')
const {
  deploy,
  WalletService,
  Web3Service,
} = require('@unlock-protocol/unlock-js')
const TokenDeployer = require('./deploy-locks')

/*
 * This script is meant to be used in dev environment to deploy a version of the Unlock smart
 * contract from the packaged version to the local ganache server.
 */
const host = process.env.HTTP_PROVIDER_HOST
const port = process.env.HTTP_PROVIDER_PORT
let programmaticPurchaser = process.env.LOCKSMITH_PURCHASER_ADDRESS // This is the locksmith user account
let userAddress = process.env.ETHEREUM_ADDRESS // This is a user account

const locksmithHost = process.env.LOCKSMITH_HOST
const locksmithPort = process.env.LOCKSMITH_PORT

let providerURL = `http://${host}:${port}`
let provider = new ethers.providers.JsonRpcProvider(providerURL, {
  chainId: 1984,
})

const serverIsUp = (delay, maxAttempts) =>
  new Promise((resolve, reject) => {
    let attempts = 1
    const tryConnecting = () => {
      const socket = net.connect(port, host, () => {
        resolve()
        return socket.end() // clean-up
      })

      socket.on('error', error => {
        if (error.code === 'ECONNREFUSED') {
          if (attempts < maxAttempts) {
            attempts += 1
            return setTimeout(tryConnecting, delay)
          }
          return reject(error)
        }
        return reject(error)
      })
    }
    tryConnecting()
  })

serverIsUp(1000 /* every second */, 120 /* up to 2 minutes */)
  .then(() => {
    const versionName = 'v12'
    return deploy(host, port, versionName, unlockContract => {
      console.log(`UNLOCK DEPLOYED AT ${unlockContract.address}`)

      const wallet = new WalletService({
        unlockAddress: unlockContract.address,
      })

      const web3Service = new Web3Service({
        readOnlyProvider: providerURL,
        unlockAddress: unlockContract.address,
        requiredConfirmations: 1,
        blockTime: 3000, // this is in milliseconds
      })

      wallet.on('account.changed', async account => {
        // Deploy the template contract
        const publicLockTemplateAddress = await wallet.deployTemplate(
          versionName
        )
        console.log(
          `TEMPLATE CONTRACT DEPLOYED AT ${publicLockTemplateAddress}`
        )

        // Configure Unlock
        await wallet.configureUnlock(
          publicLockTemplateAddress,
          'KEY',
          `http://${locksmithHost}:${locksmithPort}/api/key/`
        )
        console.log('UNLOCK CONFIGURED')

        // Once Unlock is deployed, we proceed to building the rest of the environment
        await TokenDeployer.prepareEnvironment(
          web3Service,
          wallet,
          account,
          provider,
          programmaticPurchaser,
          userAddress
        )
      })

      wallet.on('network.changed', () => {
        wallet.getAccount()
      })

      wallet.connect(providerURL)
    })
  })
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
