import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import '@unlock-protocol/hardhat-plugin'

import path from 'path'
import fs from 'fs-extra'

const SUBGRAPH_NETWORKS_CONFIG_PATH = path.join(
  __dirname,
  '..',
  './docker/development/subgraph/networks.json'
)

const { localhost: subgraphConfig } = fs.readJSONSync(
  SUBGRAPH_NETWORKS_CONFIG_PATH
)

const unlockAddress = subgraphConfig.Unlock.address

const config: HardhatUserConfig = {
  solidity: '0.8.9',
  unlock: {
    31337: {
      unlockAddress,
    },
  },
  mocha: {
    timeout: 2000000,
  },
}

export default config
