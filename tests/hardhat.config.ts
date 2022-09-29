import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import '@unlock-protocol/hardhat-plugin'

import path from 'path'
import fs from 'fs-extra'

const SUBGRAPH_NETWORKS_CONFIG_PATH = process.env.CI
  ? '/home/unlock/networks.json'
  : path.join(__dirname, '..', './docker/development/subgraph/networks.json')

const { localhost: subgraphConfig } = fs.readJSONSync(
  SUBGRAPH_NETWORKS_CONFIG_PATH
)

const unlockAddress = subgraphConfig.Unlock.address

const config: HardhatUserConfig = {
  solidity: '0.8.9',
  networks: {
    docker: {
      url: 'http://eth-node:8545',
    },
  },
  unlock: {
    31337: {
      unlockAddress,
    },
    docker: {
      unlockAddress,
      url: 'http://localhost:8545',
    },
  },
  mocha: {
    timeout: 2000000,
  },
}

export default config
