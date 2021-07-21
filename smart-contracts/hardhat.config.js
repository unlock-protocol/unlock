// hardhat.config.js

require('@nomiclabs/hardhat-truffle5')

// erc1820 deployment
require('hardhat-erc1820')

// for upgrades
require('@nomiclabs/hardhat-ethers')
require('@openzeppelin/hardhat-upgrades')

// gas reporting for tests
require('hardhat-gas-reporter')

// contract verification
if (process.env.ETHERSCAN_API_KEY) {
  // eslint-disable-next-line global-require
  require('@nomiclabs/hardhat-etherscan')
}

const { task } = require('hardhat/config')

// const { deploy } = require('./scripts/deploy')

const { getHardhatNetwork } = require('./helpers/network')

const settings = {
  optimizer: {
    enabled: true,
    runs: 200,
  },
}

// When running CI, we connect to the 'ganache' container
const testHost = process.env.CI === 'true' ? 'ganache' : '127.0.0.1'

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

const etherscan = process.env.ETHERSCAN_API_KEY
  ? {
      apiKey: process.env.ETHERSCAN_API_KEY,
    }
  : {}

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
      { version: '0.5.7', settings },
      { version: '0.5.9', settings },
      { version: '0.5.14', settings },
      { version: '0.5.17', settings },
      { version: '0.6.12', settings },
      { version: '0.7.6', settings },
      { version: '0.8.4', settings },
    ],
  },
}
