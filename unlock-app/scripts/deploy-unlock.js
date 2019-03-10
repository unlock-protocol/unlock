/* eslint-disable no-console */

const Web3 = require('web3')
const Unlock = require('unlock-abi-0').Unlock
const net = require('net')

/*
 * This script is meant to be used in dev environment to deploy a version of the Unlock smart
 * contract from the packaged version to the local ganache server.
 */

const host = process.env.HTTP_PROVIDER || '127.0.0.1'
const port = 8545
const web3 = new Web3(`http://${host}:${port}`)
const unlock = new web3.eth.Contract(Unlock.abi)

const serverIsUp = (delay, maxAttempts) =>
  new Promise((resolve, reject) => {
    let attempts = 1
    const tryConnecting = () => {
      const socket = net.connect(
        port,
        host,
        () => {
          resolve()
          return socket.end() // clean-up
        }
      )

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

let accounts
serverIsUp(1000 /* every second */, 120 /* up to 2 minutes */)
  .then(() => {
    // Get accounts
    return web3.eth.getAccounts()
  })
  .then(_accounts => {
    accounts = _accounts
    // Deploy contract
    return unlock
      .deploy({
        data: Unlock.bytecode,
      })
      .send({
        from: accounts[0],
        gas: 4000000,
      })
  })
  .then(newContractInstance => {
    // Echo the contract address
    console.log(newContractInstance.options.address)

    // Initialize
    const data = unlock.methods.initialize(accounts[0]).encodeABI()
    return web3.eth.sendTransaction({
      to: newContractInstance.options.address,
      from: accounts[0],
      data,
      gas: 1000000,
    })
  })
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
