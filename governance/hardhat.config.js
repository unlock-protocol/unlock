// hardhat.config.js
const { copySync } = require('fs-extra')

require('@nomiclabs/hardhat-ethers')
require('@nomiclabs/hardhat-etherscan')
require('@nomiclabs/hardhat-waffle')

require('@openzeppelin/hardhat-upgrades')

// import helpers
const {
  etherscan,
  networks,
  parseForkUrl,
} = require('@unlock-protocol/hardhat-helpers')

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

// mainnet fork
if (process.env.RUN_FORK) {
  parseForkUrl(networks, process.env.RUN_FORK)

  // replace localhost manifest by mainnet one
  copySync('.openzeppelin/mainnet.json', '.openzeppelin/unknown-31337.json')
}

// tasks
require('./tasks/balance')
require('./tasks/safe')
require('./tasks/gov')
require('./tasks/verify')
require('./tasks/deploy')
require('./tasks/set')
require('./tasks/unlock')

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
