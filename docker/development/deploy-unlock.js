/* eslint-disable no-console */
const net = require('net')
const ethers = require('ethers')
const {
  deploy,
  WalletService,
  Web3Service,
} = require('@unlock-protocol/unlock-js')
const TokenDeployer = require('./deploy-locks')
const ExternalRefundDeployer = require('./deploy-external-refund')

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
    return deploy(host, port, 'v11', unlockContract => {
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
        // Once Unlock is deployed, we proceed to building the rest of the environment
        await TokenDeployer.prepareEnvironment(
          web3Service,
          wallet,
          account,
          provider,
          programmaticPurchaser,
          userAddress
        )

        // Change the base URL for token metadata
        const baseUri = 'http://0.0.0.0:8080/api/key/'
        unlockContract.setGlobalBaseTokenURI(baseUri)

        // TODO REMOVE AS THIS IS NOT USED ANYMORE
        let lockAddress = '0x0AAF2059Cb2cE8Eeb1a0C60f4e0f2789214350a5'
        let tokenAddress = '0x591AD9066603f5499d12fF4bC207e2f577448c46'
        await ExternalRefundDeployer.deployExternalRefund(
          lockAddress,
          '21500000000000000000',
          tokenAddress,
          provider
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
