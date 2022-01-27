import { HardhatUserConfig } from 'hardhat/types'

// We load the plugin here.
import '../../../src/index'

const config: HardhatUserConfig = {
  solidity: '0.7.3',
  defaultNetwork: 'hardhat',
  paths: {
    newPath: 'asd',
  },
}

export default config
