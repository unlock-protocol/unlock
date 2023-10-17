// hardhat.config.js
require('@nomiclabs/hardhat-ethers')
require('@nomiclabs/hardhat-etherscan')

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

// require('./tasks/accounts')
// require('./tasks/deploy')
// require('./tasks/upgrade')
// require('./tasks/set')
// require('./tasks/release')
// require('./tasks/utils')
// require('./tasks/lock')
// require('./tasks/keys')
// require('./tasks/unlock')

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
