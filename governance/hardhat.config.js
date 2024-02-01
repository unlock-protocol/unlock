// hardhat.config.js
const { copySync } = require('fs-extra')

require('@nomicfoundation/hardhat-ethers')
require('@nomicfoundation/hardhat-verify')
require('@openzeppelin/hardhat-upgrades')

// import helpers
const {
  etherscan,
  networks,
  parseForkUrl,
} = require('@unlock-protocol/hardhat-helpers')

// zksync
if (process.env.ZK_SYNC) {
  require('@matterlabs/hardhat-zksync-solc')
  require('@matterlabs/hardhat-zksync-verify')
  require('@matterlabs/hardhat-zksync-upgradable')
}

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
  parseForkUrl(networks)

  // replace localhost manifest by mainnet one
  copySync('.openzeppelin/mainnet.json', '.openzeppelin/unknown-31337.json')
}

// add tenderly if needed
if (process.env.TENDERLY_FORK) {
  const tdly = require('@tenderly/hardhat-tenderly')
  tdly.setup()
  networks.tenderly = {
    url: process.env.TENDERLY_FORK,
    accounts: networks.mainnet.accounts,
  }
}

// tasks
require('./tasks/balance')
require('./tasks/safe')
require('./tasks/gov')
require('./tasks/verify')
require('./tasks/deploy')
require('./tasks/set')
require('./tasks/unlock')
require('./tasks/lock')

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
const config = {
  networks,
  etherscan,
  solidity: {
    compilers: [{ version: '0.8.21', settings }],
  },
  sourcify: {
    enabled: true,
  },
}

if (process.env.ZK_SYNC) {
  config.zksolc = {
    version: 'latest',
    settings: {},
  }
}

module.exports = config
