import { Env } from './types'

// This is the list of networks currently supported
const supportedNetworks = (env: Env, networkId: string): string | undefined => {
  return {
    '1': env.MAINNET_PROVIDER,
    '5': env.GOERLI_PROVIDER,
    '10': env.OPTIMISM_PROVIDER,
    '56': env.BSC_PROVIDER,
    '100': env.GNOSIS_PROVIDER,
    '137': env.POLYGON_PROVIDER,
    '42161': env.ARBITRUM_PROVIDER,
    '42220': env.CELO_PROVIDER,
    '43114': env.AVALANCHE_PROVIDER,
    '80001': env.MUMBAI_PROVIDER,
    '11297108109': env.PALM_PROVIDER,
  }[networkId]
}

export default supportedNetworks
