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

// test coverage
require('solidity-coverage')

// eslint-disable-next-line global-require
require('@nomiclabs/hardhat-etherscan')

// check contract size
require('hardhat-contract-sizer')

// our own hardhat plugin (for mainnet tests)
require('@unlock-protocol/hardhat-plugin')

// import helpers
const { etherscan } = require('@unlock-protocol/hardhat-helpers')

const { getHardhatNetwork } = require('./helpers/network')

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

const networks = getHardhatNetwork()
networks.hardhat = {
  initialBaseFeePerGas: 100000000,
}

// mainnet fork
if (process.env.RUN_FORK) {
  const chainId = parseInt(process.env.RUN_FORK)
  if(isNaN(chainId)) {
    throw Error(`chain id ('${process.env.RUN_FORK}') should be a number`)
  }
  console.log(`Running a fork (chainId : ${chainId})...`)
  networks.hardhat = {
    chainId,
    forking: {
      url: `https://rpc.unlock-protocol.com/${chainId}`,
    },
  }
  
  // needed for Uniswap Router to compute routes on local forks
  networks.hardhat.blockGasLimit = 1_000_000_000

  // set the correct chainId to use with local node over RPC 
  networks.localhost.chainId = chainId

  // replace localhost manifest by mainnet one
  copySync('.openzeppelin/mainnet.json', '.openzeppelin/unknown-31337.json')
}



// tasks
require('./tasks/accounts')
require('./tasks/balance')
require('./tasks/deploy')
require('./tasks/upgrade')
require('./tasks/set')
require('./tasks/gnosis')
require('./tasks/release')
require('./tasks/gov')
require('./tasks/utils')
require('./tasks/lock')
require('./tasks/verify')
require('./tasks/keys')
require('./tasks/unlock')

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  networks,
  etherscan,
  gasReporter: {
    currency: 'USD',
    excludeContracts: ['TestNoop'],
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
      { version: '0.8.2', settings },
      { version: '0.8.4', settings },
      { version: '0.8.7', settings },
      { version: '0.8.13', settings },
      { version: '0.8.17', settings },
    ],
  },
  mocha: {
    timeout: 2000000,
  },
  contractSizer: {
    alphaSort: true,
    only: [':PublicLock', 'Mixin'],
  },
}
