// See <http://truffleframework.com/docs/advanced/configuration>
// to customize your Truffle configuration!

// Allows us to use ES6 in our migrations and tests. TODO: does this belong here?
require('babel-register')
require('babel-polyfill')
const HDWalletProvider = require('truffle-hdwallet-provider')

/**
 * Used for rinkeby deployments
 */
const rinkebyProviderUrl = process.env.RINKEBY_PROVIDER_URL
let rinkebyMnemonic = {
  seed: '',
  accountIndex: 0,
}
if (rinkebyProviderUrl) {
  rinkebyMnemonic = require('./mnemonic.rinkeby')
}

/**
 * Used for mainnet deployments
 */
const mainnetProviderUrl = process.env.MAINNET_PROVIDER_URL
let mainnetMnemonic = {
  seed: '',
  accountIndex: 0,
}
if (mainnetProviderUrl) {
  mainnetMnemonic = require('./mnemonic.mainnet')
}

// When running CI, we connect to the 'ganache' container
const testHost = process.env.CI ? 'ganache' : '127.0.0.1'

const mainnetProvider = function() {
  return new HDWalletProvider(
    mainnetMnemonic.seed,
    mainnetProviderUrl,
    mainnetMnemonic.accountIndex
  )
}

const rinkebyProvider = function() {
  return new HDWalletProvider(
    rinkebyMnemonic.seed,
    rinkebyProviderUrl,
    rinkebyMnemonic.accountIndex
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
      provider: rinkebyProvider,
      network_id: '4', // Network Id for Rinkeby
      gas: 5000000,
      gasPrice: 35000000000,
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
        evmVersion: 'petersburg',
      },
    },
  },
  mocha: {
    useColors: true,
  },
  plugins: ['truffle-security'],
}
