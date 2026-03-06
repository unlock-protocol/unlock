import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-ethers'
import '@unlock-protocol/hardhat-plugin'

const config: HardhatUserConfig = {
  solidity: '0.8.9',
  networks: {
    docker: {
      url: 'http://localhost:8545',
    },
    hardhat: {
      forking: {
        url: 'https://sepolia.base.org',
        blockNumber: 37321522,
      },
      chains: {
        84532: {
          hardforkHistory: {
            shanghai: 0,
          },
        },
      },
    },
  },
}

export default config
