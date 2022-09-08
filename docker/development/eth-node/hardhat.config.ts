import { HardhatUserConfig } from 'hardhat/config'
import '@nomiclabs/hardhat-ethers'
import '@unlock-protocol/hardhat-plugin'

const config: HardhatUserConfig = {
  solidity: '0.8.9',
  networks: {
    docker: {
      url: 'http://localhost:8545',
    },
  },
}

export default config
