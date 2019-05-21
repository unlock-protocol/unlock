/* eslint-disable no-console */

const {
  deploy,
  getWeb3Provider,
  WalletService,
  Web3Service,
} = require('@unlock-protocol/unlock-js')
const net = require('net')

/*
 * This script is meant to be used in dev environment to deploy a version of the Unlock smart
 * contract from the packaged version to the local ganache server.
 */

const host = process.env.HTTP_PROVIDER || '127.0.0.1'
const port = 8545

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

let deployedLockAddress

serverIsUp(1000 /* every second */, 120 /* up to 2 minutes */)
  .then(() => {
    return deploy(host, port, 'v02', newContractInstance => {
      // Once unlock has been deployed, we need to deploy a lock too!

      const provider = getWeb3Provider(`http://${host}:${port}/`)
      const wallet = new WalletService({
        unlockAddress: newContractInstance.options.address,
      })

      const web3 = new Web3Service({
        readOnlyProvider: `http://${host}:${port}/`,
        unlockAddress: newContractInstance.options.address,
      })

      // This will be called multiple times, for each confirmation
      web3.on('lock.updated', address => {
        if (!deployedLockAddress) {
          deployedLockAddress = address
          console.log(`Lock deployed at ${address}`)
        }
      })

      wallet.on('lock.updated', (_, { transaction }) => {
        web3.getTransaction(transaction)
      })

      wallet.on('account.changed', account => {
        wallet.createLock(
          {
            expirationDuration: 60 * 5, // 1 minute!
            keyPrice: '0.01', // 0.01 Eth
            maxNumberOfKeys: -1, // Unlimited
          },
          account
        )
      })

      wallet.on('network.changed', () => {
        wallet.getAccount()
      })
      wallet.connect(provider)
    })
  })
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
