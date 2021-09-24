/* eslint-disable no-console */

// NOTE: THIS SCRIPT IS CURRENTLY ONLY USED BY THE INTEGRATION TESTS
// BECAUSE WE DO NOT USE OUR OWN ganache.dockerfile in that context

const { deploy, WalletService, latest } = require('@unlock-protocol/unlock-js')
const net = require('net')

/*
 * This script is meant to be used in dev environment to deploy a version of the Unlock smart
 * contract from the packaged version to the local eth node.
 */

const host = process.env.HTTP_PROVIDER || '127.0.0.1'
const port = 8545

const locksmithHost = process.env.LOCKSMITH_HOST
const locksmithPort = process.env.LOCKSMITH_PORT

const serverIsUp = (delay, maxAttempts) =>
  new Promise((resolve, reject) => {
    let attempts = 1
    const tryConnecting = () => {
      const socket = net.connect(port, host, () => {
        resolve()
        return socket.end() // clean-up
      })

      socket.on('error', (error) => {
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
    const versionName = latest
    return deploy(host, port, versionName, (newContractInstance) => {
      console.log(`UNLOCK DEPLOYED AT ${newContractInstance.address}`)
      // We need to configure it!
      const wallet = new WalletService()
      wallet.setUnlockAddress(newContractInstance.address)
      wallet.on('account.changed', async () => {
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
      })
    })
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
