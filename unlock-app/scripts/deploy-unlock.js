/* eslint-disable no-console */

const { deploy } = require('@unlock-protocol/unlock-js')
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

serverIsUp(1000 /* every second */, 120 /* up to 2 minutes */)
  .then(() => {
    return deploy(host, port, 'v10', newContractInstance => {
      console.log(newContractInstance.options.address)
    })
  })
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
