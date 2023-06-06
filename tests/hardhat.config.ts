import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import '@unlock-protocol/hardhat-plugin'

import path from 'path'
import fs from 'fs-extra'

const SUBGRAPH_NETWORKS_CONFIG_PATH = process.env.CI
  ? '/home/unlock/networks.json'
  : path.join(__dirname, '..', './subgraph/networks.json')

const { localhost: subgraphConfig } = fs.readJSONSync(
  SUBGRAPH_NETWORKS_CONFIG_PATH
)

const unlockAddress = '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6' // subgraphConfig.Unlock.address

const config: HardhatUserConfig = {
  solidity: '0.8.9',
  networks: {
    docker: {
      url: 'http://0.0.0.0:8545',
    },
  },
  unlock: {
    31337: {
      unlockAddress,
    },
    docker: {
      unlockAddress,
    },
  },
  mocha: {
    timeout: 2000000,
  },
}

export default config
