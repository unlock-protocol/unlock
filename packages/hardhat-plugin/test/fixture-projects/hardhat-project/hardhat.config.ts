import { HardhatUserConfig } from 'hardhat/types'

import '@nomicfoundation/hardhat-toolbox'

// We load the plugin here.
import '../../../src/index'

const settings = {
  optimizer: {
    enabled: true,
    runs: 200,
  },
}

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.7',
    settings,
  },
  defaultNetwork: 'hardhat',
  unlock: {
    31337: {
      name: 'Custom Localhost Name',
      subgraph: {
        endpoint: 'here goes a subgraph URI',
        graphId: 'here goes a graph ID',
      },
    },
    1: {
      unlockAddress: 'newAddress',
    },
    12345: {
      name: 'New Network',
      id: 12345,
    },
  },
}

export default config
