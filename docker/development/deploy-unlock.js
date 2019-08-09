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
    return deploy(host, port, 'v11', newContractInstance => {
      console.log(`UNLOCK DEPLOYED AT ${newContractInstance.address}`)

      // Once unlock has been deployed, we need to deploy a lock too!
      const wallet = new WalletService({
        unlockAddress: newContractInstance.options.address,
      })

      const web3Service = new Web3Service({
        readOnlyProvider: providerURL,
        unlockAddress: newContractInstance.options.address,
        requiredConfirmations: 1,
        blockTime: 3000, // this is in milliseconds
      })

      wallet.on('account.changed', async account => {
        // Once Unlock is deployed, we proceed to building the rest of the environment
        TokenDeployer.prepareEnvironment(
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
