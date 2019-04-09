// const Web3 = require('web3')
// See <http://truffleframework.com/docs/advanced/configuration>
// to customize your Truffle configuration!

// Allows us to use ES6 in our migrations and tests. TODO: does this belong here?
require('babel-register')
require('babel-polyfill')
const HDWalletProvider = require('truffle-hdwallet-provider')

// const rinkebyHost = process.env.RINKEBY_HOST
// const rinkebyHostUsername = process.env.RINKEBY_HOST_USERNAME
// const rinkebyHostPassword = process.env.RINKEBY_HOST_PASSWORD
// const rinkebyProviderUrl = `https://${rinkebyHostUsername}:${rinkebyHostPassword}@${rinkebyHost}/`

/**
 * Used for main net deployments
 * TODO: consider using the same mechanism for Rinkeby
 */
const mnemonic = require('./mnemonic')

// When running CI, we connect to the 'ganache' container
const testHost = process.env.CI ? 'ganache' : '127.0.0.1'

const mainnetProvider = function() {
  return new HDWalletProvider(
    mnemonic.seed,
    process.env.MAIN_NET_NODE,
    mnemonic.accountIndex
  )
}

module.exports = {
  networks: {
    development: {
      // used for local dev
      host: testHost,
      port: 8545,
      network_id: '*', // Match any network id
    },
    rinkeby: {
      // provider: new Web3.providers.HttpProvider(rinkebyProviderUrl),
      network_id: '4', // Network Id for Rinkeby
    },
    mainnet: {
      provider: mainnetProvider,
      network_id: 1,
      gas: 7000000,
      gasPrice: 35000000000,
    },
  },
  compilers: {
    solc: {
      version: '0.5.7',
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
      },
    },
  },
  mocha: {
    useColors: true,
  },
}
