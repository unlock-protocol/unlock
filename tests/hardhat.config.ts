import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import '@unlock-protocol/hardhat-plugin'

import { localhost } from '@unlock-protocol/networks'

const config: HardhatUserConfig = {
  solidity: '0.8.9',
  networks: {
    docker: {
      url: 'http://eth-node:8545',
    },
  },
  unlock: {
    localhost,
    31337: localhost,
    docker: localhost,
  },
  mocha: {
    timeout: 2000000,
  },
}

export default config
