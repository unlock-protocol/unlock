import { HardhatUserConfig } from 'hardhat/types'

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
    },
    12345: {
      name: 'New Network',
      id: 12345,
    },
  },
}

export default config
