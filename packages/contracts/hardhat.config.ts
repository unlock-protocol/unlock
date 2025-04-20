import { HardhatUserConfig } from 'hardhat/config'
import 'solidity-docgen'
require('./task/exportAbis')
import 'solidity-docgen'
import '@nomiclabs/hardhat-ethers'
import '@typechain/hardhat'

const contractsPath = './src/contracts'

const settings = {
  optimizer: {
    enabled: true,
    runs: 80,
  },
}

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
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
      {
        version: '0.8.21',
        settings: {
          ...settings,
          evmVersion: 'shanghai',
        },
      },
    ],
  },
  docgen: {
    pages: 'files',
    exclude: [
      'IERC165',
      'IERC721',
      'IERC721Enumerable',
      'Initializable',
      'UP',
      'utils',
      'Governor',
      'UnlockDiscountToken',
    ],
  },
  paths: {
    sources: contractsPath,
  },
  typechain: {
    outDir: 'types',
    target: 'ethers-v5',
  },
  mocha: {
    timeout: 2000000,
  },
}

export default config
