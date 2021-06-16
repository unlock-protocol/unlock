/* eslint-disable global-require */
// See <http://truffleframework.com/docs/advanced/configuration>
// to customize your Truffle configuration!

const HDWalletProvider = require('@truffle/hdwallet-provider')

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
 * Used for xdai deployments
 */
const xdaiProviderUrl = process.env.XDAI_PROVIDER_URL
let xdaiMnemonic = {
  seed: '',
  accountIndex: 0,
}
if (xdaiProviderUrl) {
  xdaiMnemonic = require('./mnemonic.xdai') // eslint-disable-line import/no-unresolved
}

/**
 * Used for polygon deployments
 */
const polygonProviderUrl = process.env.POLYGON_PROVIDER_URL
let polygonMnemonic = {
  seed: '',
  accountIndex: 0,
}
if (polygonProviderUrl) {
  polygonMnemonic = require('./mnemonic.polygon') // eslint-disable-line import/no-unresolved
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
const testHost = process.env.CI === 'true' ? 'ganache' : '127.0.0.1'

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

function xdaiProvider() {
  return new HDWalletProvider(
    xdaiMnemonic.seed,
    xdaiProviderUrl,
    xdaiMnemonic.accountIndex
  )
}

function polygonProvider() {
  return new HDWalletProvider(
    polygonMnemonic.seed,
    polygonProviderUrl,
    polygonMnemonic.accountIndex
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
    },
    ropsten: {
      provider: ropstenProvider,
      network_id: '3', // Network Id for Ropsten
    },
    kovan: {
      provider: kovanProvider,
      network_id: '42', // Network Id for Kovan
    },
    mainnet: {
      provider: mainnetProvider,
      network_id: 1, // Network Id for Mainnet
    },
    xdai: {
      provider: xdaiProvider,
      network_id: 100, // Network Id for xdai
    },
    polygon: {
      provider: polygonProvider,
      network_id: 137, // Network Id for Polygon
    },
  },
  compilers: {
    // When changing the following settings, update .openzeppelin/project.json to match
    solc: {
      version: '0.5.17',
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
        // evmVersion is optional here but must be manually specified in .openzeppelin/project.json
        evmVersion: 'istanbul',
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
