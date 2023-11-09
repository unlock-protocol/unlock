// hardhat.config.js
require('@nomiclabs/hardhat-ethers')
require('@nomiclabs/hardhat-etherscan')
require('@nomiclabs/hardhat-waffle')

require('@openzeppelin/hardhat-upgrades')

// import helpers
const { etherscan, networks } = require('@unlock-protocol/hardhat-helpers')

const settings = {
  optimizer: {
    enabled: true,
    runs: 80,
  },
  outputSelection: {
    '*': {
      '*': ['storageLayout'],
    },
  },
}

// tasks
require('./tasks/balance')
require('./tasks/safe')
require('./tasks/gov')
require('./tasks/verify')
require('./tasks/deploy')

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  networks,
  etherscan,
  solidity: {
    compilers: [{ version: '0.8.21', settings }],
  },
}
