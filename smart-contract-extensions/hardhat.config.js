/**
 * @type import('hardhat/config').HardhatUserConfig
 */

require('@nomiclabs/hardhat-ethers')

// gas reporting for tests
require('hardhat-gas-reporter')

// truffle testing
require('@nomiclabs/hardhat-truffle5')

//
require('@unlock-protocol/hardhat-plugin')

// code coverage
require('solidity-coverage')

const settings = {
  optimizer: {
    enabled: true,
    runs: 2000000,
  },
}

const networks = {}

// mocha config
let extension = ['js']
let ignore = ['**/*.mainnet.js']

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
    },
  }
}

module.exports = {
  networks,
  solidity: {
    compilers: [
      { version: '0.8.2', settings },
      { version: '0.8.13', settings },
    ],
  },
  gasReporter: {
    currency: 'USD',
    excludeContracts: ['Migrations'],
    gasPrice: 5,
  },
  mocha: {
    extension,
    ignore,
  },
}
