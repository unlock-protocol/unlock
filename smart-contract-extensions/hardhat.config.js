/**
 * @type import('hardhat/config').HardhatUserConfig
 */

// gas reporting for tests
require('hardhat-gas-reporter')

// truffle testing
require('@nomiclabs/hardhat-truffle5')

// code coverage
require("solidity-coverage");

const settings = {
  optimizer: {
    enabled: true,
    runs: 2000000,
  },
}

module.exports = {
  solidity: {
    compilers: [{ version: '0.8.2', settings }],
  },
  gasReporter: {
    currency: 'USD',
    excludeContracts: ['Migrations'],
    gasPrice: 5,
  },
}
