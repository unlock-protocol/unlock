// hardhat.config.js
const { copySync } = require('fs-extra')

require('@nomiclabs/hardhat-ethers')
require('@nomiclabs/hardhat-truffle5')

// full stack trace if needed
require('hardhat-tracer')

// erc1820 deployment
require('hardhat-erc1820')

// for upgrades
require('@openzeppelin/hardhat-upgrades')

// debug storage
require('hardhat-storage-layout')

// gas reporting for tests
require('hardhat-gas-reporter')

// contract verification
if (process.env.ETHERSCAN_API_KEY) {
  // eslint-disable-next-line global-require
  require('@nomiclabs/hardhat-etherscan')
}

const { getHardhatNetwork } = require('./helpers/network')

const settings = {
  optimizer: {
    enabled: true,
    runs: 200,
  },
  outputSelection: {
    '*': {
      '*': ['storageLayout'],
    },
  },
}

// When running CI, we connect to the hardhat node container
const testHost = process.env.CI === 'true' ? 'eth-node' : '127.0.0.1'
const defaultNetworks = {
  ganache: {
    url: `http://${testHost}:8545`,
    chainId: 1337,
    accounts: {
      mnemonic: 'hello unlock save the web',
    },
  },
}

const networks = getHardhatNetwork(defaultNetworks)

// Etherscan api for verification
const etherscan = process.env.ETHERSCAN_API_KEY
  ? {
      apiKey: process.env.ETHERSCAN_API_KEY,
    }
  : {}

// add mainnet fork -- if API key is present
if (process.env.RUN_MAINNET_FORK) {
  // eslint-disable-next-line no-console
  console.log('Running a mainnet fork...')
  const alchemyAPIKey = process.env.ALCHEMY_API_KEY
  if (!alchemyAPIKey) {
    throw new Error('Missing Alchemy API Key, couldnt run a mainnet fork')
  }
  const alchemyURL = `https://eth-mainnet.alchemyapi.io/v2/${alchemyAPIKey}`
  networks.hardhat = {
    forking: {
      url: alchemyURL,
      blockNumber: 13102200, // Aug 20th 2021
      // gasPrice: 150000000000, // not working, see https://github.com/nomiclabs/hardhat/issues/1216
    },
  }

  // replace localhost manifest by mainnet one
  copySync('.openzeppelin/mainnet.json', '.openzeppelin/unknown-31337.json')
}

// tasks
require('./tasks/accounts')
require('./tasks/balance')
require('./tasks/config')
require('./tasks/deploy')
require('./tasks/impl')
require('./tasks/upgrade')
require('./tasks/set')
require('./tasks/gnosis')

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  networks,
  etherscan,
  gasReporter: {
    currency: 'USD',
    excludeContracts: ['Migrations', 'TestNoop'],
    gasPrice: 5,
  },
  solidity: {
    compilers: [
      { version: '0.4.24', settings },
      { version: '0.4.25', settings },
      { version: '0.5.0', settings },
      { version: '0.5.17', settings },
      { version: '0.5.14', settings },
      { version: '0.5.7', settings },
      { version: '0.5.9', settings },
      { version: '0.6.12', settings },
      { version: '0.7.6', settings },
      { version: '0.8.0', settings },
      { version: '0.8.4', settings },
    ],
  },
}
