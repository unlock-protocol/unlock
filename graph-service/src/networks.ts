import { Env } from './types'

export function getSubgraphUrl(
  networkId: string,
  env: Env
): string | undefined {
  return {
    '1': env.MAINNET_SUBGRAPH,
    '10': env.OPTIMISM_SUBGRAPH,
    '56': env.BSC_SUBGRAPH,
    '100': env.GNOSIS_SUBGRAPH,
    '137': env.POLYGON_SUBGRAPH,
    '324': env.ZKSYNC_SUBGRAPH,
    '1101': env.ZKEVM_SUBGRAPH,
    '42161': env.ARBITRUM_SUBGRAPH,
    '42220': env.CELO_SUBGRAPH,
    '43114': env.AVALANCHE_SUBGRAPH,
    '84532': env.BASE_SEPOLIA_SUBGRAPH,
    '8453': env.BASE_SUBGRAPH,
    '11155111': env.SEPOLIA_SUBGRAPH,
    '59144': env.LINEA_SUBGRAPH,
    '534352': env.SCROLL_SUBGRAPH,
  }[networkId]
}
