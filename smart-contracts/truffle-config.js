/* eslint-disable global-require */
// See <http://truffleframework.com/docs/advanced/configuration>
// to customize your Truffle configuration!

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
  rinkebyMnemonic = require('./mnemonic.rinkeby') // eslint-disable-line import/no-unresolved
}

/**
 * Used for ropsten deployments
 */
const ropstenProviderUrl = process.env.ROPSTEN_PROVIDER_URL
let ropstenMnemonic = {
  seed: '',
  accountIndex: 0,
}
if (ropstenProviderUrl) {
  ropstenMnemonic = require('./mnemonic.ropsten') // eslint-disable-line import/no-unresolved
}

/**
 * Used for kovan deployments
 */
const kovanProviderUrl = process.env.KOVAN_PROVIDER_URL
let kovanMnemonic = {
  seed: '',
  accountIndex: 0,
}
if (kovanProviderUrl) {
  kovanMnemonic = require('./mnemonic.kovan') // eslint-disable-line import/no-unresolved
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
  mainnetMnemonic = require('./mnemonic.mainnet') // eslint-disable-line import/no-unresolved
}

// When running CI, we connect to the 'ganache' container
const testHost = process.env.CI ? 'ganache' : '127.0.0.1'

function mainnetProvider() {
  return new HDWalletProvider(
    mainnetMnemonic.seed,
    mainnetProviderUrl,
    mainnetMnemonic.accountIndex
  )
}

function rinkebyProvider() {
  return new HDWalletProvider(
    rinkebyMnemonic.seed,
    rinkebyProviderUrl,
    rinkebyMnemonic.accountIndex
  )
}

function ropstenProvider() {
  return new HDWalletProvider(
    ropstenMnemonic.seed,
    ropstenProviderUrl,
    ropstenMnemonic.accountIndex
  )
}

function kovanProvider() {
  return new HDWalletProvider(
    kovanMnemonic.seed,
    kovanProviderUrl,
    kovanMnemonic.accountIndex
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
      gas: 6400000,
      gasPrice: 5000000000, // 5GWEI
    },
    ropsten: {
      provider: ropstenProvider,
      network_id: '3', // Network Id for Ropsten
      gas: 5000000,
      gasPrice: 5000000000, // 5GWEI
    },
    kovan: {
      provider: kovanProvider,
      network_id: '42', // Network Id for Kovan
      gas: 10000000,
      gasPrice: 5000000000, // 5GWEI
    },
    mainnet: {
      provider: mainnetProvider,
      network_id: 1, // Network Id for Mainnet
      gas: 6400000,
      gasPrice: 5000000000, // 5GWEI
    },
  },
  compilers: {
    solc: {
      version: '0.5.17',
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
      },
    },
  },
  mocha: {
    reporter: 'eth-gas-reporter',
    useColors: true,
    reporterOptions: {
      currency: 'USD',
      excludeContracts: ['Migrations', 'TestNoop'],
      gasPrice: 5,
    },
  },
  plugins: ['truffle-security'],
}
