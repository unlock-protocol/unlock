/**
 * @type import('hardhat/config').HardhatUserConfig
 */

// to build contract docs
require('@primitivefi/hardhat-dodoc')

const fs = require('fs-extra')
const { networks, etherscan } = require('@unlock-protocol/hardhat-helpers')

require('./task/exportAbis')

const contractsPath = './src/contracts'

// list all interfaces to document
const contractsToDocument = fs
  .readdirSync(contractsPath)
  .map((contractName) =>
    fs.readdirSync(`${contractsPath}/${contractName}`).filter(
      (n) =>
        n.startsWith('I') && // only interfaces
        !n.includes('Sol') && // exclude various solc versions
        !n.startsWith('IUnlockDiscountToken') // exclude UDT
    )
  )
  .flat()

const settings = {
  optimizer: {
    enabled: true,
    runs: 200,
  },
}

module.exports = {
  networks,
  etherscan,
  solidity: {
    compilers: [
      { version: '0.4.24', settings },
      { version: '0.4.25', settings },
      { version: '0.5.0', settings },
      { version: '0.5.12', settings },
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
    ],
  },
  dodoc: {
    // debugMode: true,
    keepFileStructure: true,
    include: contractsToDocument,
    exclude: [
      'IERC165',
      'IERC721',
      'IERC721Enumerable',
      'Initializable',
      'IPublicLockV8Sol5',
    ],
  },
  paths: {
    sources: contractsPath,
  },
  mocha: {
    timeout: 2000000,
  },
}
