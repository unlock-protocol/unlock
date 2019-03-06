/* eslint-disable no-console */

const Web3 = require('web3')
const Unlock = require('unlock-abi-0').Unlock

/*
 * This script is meant to be used in dev environment to deploy a version of the Unlock smart
 * contract from the packaged version to the local ganache server.
 */

const web3 = new Web3('http://localhost:8545')
const unlock = new web3.eth.Contract(Unlock.abi)

web3.eth
  .getAccounts()
  .then(accounts => {
    unlock
      .deploy({
        data: Unlock.bytecode,
      })
      .send({
        from: accounts[0],
        gas: 4000000,
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
  })
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
