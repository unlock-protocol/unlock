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

// add mainnet fork -- if API key is present
if (process.env.RUN_MAINNET_FORK) {
  // eslint-disable-next-line no-console
  console.log('Running a mainnet fork...')
  networks.hardhat = {
    forking: {
      url: 'https://rpc.unlock-protocol.com/mainnet',
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
}
