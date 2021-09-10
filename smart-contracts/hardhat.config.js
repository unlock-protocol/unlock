// hardhat.config.js
const { task } = require('hardhat/config')
const { copySync } = require('fs-extra')
const { getNetworkName } = require('./helpers/network')
const { getDeployment } = require('./helpers/deployments')
const OZ_SDK_EXPORT = require('./openzeppelin-cli-export.json')

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

task('accounts', 'Prints the list of accounts', async () => {
  // eslint-disable-next-line no-undef
  const accounts = await ethers.getSigners()

  accounts.forEach((account, i) => {
    // eslint-disable-next-line no-console
    console.log(`[${i}]: ${account.address}`)
  })
})

task('balance', "Prints an account's balance")
  .addParam('account', "The account's address")
  .setAction(async (taskArgs) => {
    const account = web3.utils.toChecksumAddress(taskArgs.account)
    const balance = await web3.eth.getBalance(account)
    // eslint-disable-next-line no-console
    console.log(web3.utils.fromWei(balance, 'ether'), 'ETH')
  })

task('upgrade', 'Upgrade a contract')
  .addParam('contract', 'The contract path')
  .setAction(async ({ contract }, { ethers, upgrades }) => {
    const { chainId } = await ethers.provider.getNetwork()
    const contractName = contract.replace('contracts/', '').replace('.sol', '')

    const networkName = process.env.RUN_MAINNET_FORK
      ? 'mainnet'
      : getNetworkName(chainId)

    // eslint-disable-next-line no-console
    console.log(`Deploying new implementation on ${networkName}...`)

    let contractInfo
    if (networkName === 'localhost') {
      contractInfo = await getDeployment(chainId, contractName)
    } else {
      ;[contractInfo] =
        OZ_SDK_EXPORT.networks[networkName].proxies[
          `unlock-protocol/${contractName}`
        ]
    }

    const { address } = contractInfo

    const Contract = await ethers.getContractFactory(contractName)
    const implementation = await upgrades.prepareUpgrade(address, Contract)

    // eslint-disable-next-line no-console
    console.log(`${contractName} implementation deployed at: ${implementation}`)
  })

task('deploy-template', 'Deploys a new PublicLock contract').setAction(
  async (params, { ethers }) => {
    const { chainId } = await ethers.provider.getNetwork()
    const networkName = process.env.RUN_MAINNET_FORK
      ? 'mainnet'
      : getNetworkName(chainId)

    const PublicLock = await ethers.getContractFactory('PublicLock')
    const publicLock = await PublicLock.deploy()
    
    // eslint-disable-next-line no-console
    console.log(
      `New PublicLock template deployed at ${publicLock.address} on ${networkName} (${publicLock.deployTransaction.hash}). Please verify it and call setTemplate on the Unlock`
    )
  }
)

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
