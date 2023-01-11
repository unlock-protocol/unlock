import { Env } from './types'

// This is the list of networks currently supported
const supportedNetworks = (env: Env, networkId: string) => {
  switch (networkId) {
    case '1':
      return env.MAINNET_PROVIDER
    case '5':
      return env.GOERLI_PROVIDER
    case '10':
      return env.OPTIMISM_PROVIDER
    case '56':
      return env.BSC_PROVIDER
    case '100':
      return env.GNOSIS_PROVIDER
    case '137':
      return env.POLYGON_PROVIDER
    case '42161':
      return env.ARBITRUM_PROVIDER
    case '42220':
      return env.CELO_PROVIDER
    case '43114':
      return env.AVALANCHE_PROVIDER
    case '80001':
      return env.MUMBAI_PROVIDER
    default:
      return null
  }
}

export default supportedNetworks
