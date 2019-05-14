/* eslint-disable no-console */
const {
  deploy,
  WalletService,
  Web3Service,
} = require('@unlock-protocol/unlock-js')
const Unlock = require('unlock-abi-0-2').Unlock
const net = require('net')
const ethers = require('ethers')
const TokenDeployer = require('./deploy-locks')

/*
 * This script is meant to be used in dev environment to deploy a version of the Unlock smart
 * contract from the packaged version to the local ganache server.
 */

const host = process.env.HTTP_PROVIDER || '127.0.0.1'
const port = 8545
let providerURL = `http://${host}:${port}`

let provider = new ethers.providers.JsonRpcProvider(providerURL, {
  chainId: 1984,
})

let deployedLockAddress
let pk = '0x08491b7e20566b728ce21a07c88b12ed8b785b3826df93a7baceb21ddacf8b61'
let recipientAddress = '0xe29ec42f0b620b1c9a716f79a02e9dc5a5f5f98a'

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
    return deploy(host, port, Unlock, newContractInstance => {
      // Once unlock has been deployed, we need to deploy a lock too!
      const wallet = new WalletService({
        unlockAddress: newContractInstance.options.address,
      })

      const web3 = new Web3Service({
        readOnlyProvider: providerURL,
        unlockAddress: newContractInstance.options.address,
      })

      console.log(
        `the unlock deployment ${newContractInstance.options.address}`
      )

      // // This will be called multiple times, for each confirmation
      web3.on('lock.updated', address => {
        if (!deployedLockAddress) {
          deployedLockAddress = address
          console.log(`Lock deployed at ${address}`)
        }
      })

      wallet.on('lock.updated', (_, { transaction }) => {
        web3.getTransaction(transaction)
      })

      wallet.on('account.changed', async account => {
        TokenDeployer.prepareEnvironment(
          wallet,
          account,
          provider,
          pk,
          recipientAddress
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
