import { Env } from './types'

// Public fallback RPC endpoints for chains whose Alchemy CDN endpoints return HTTP 525
// from Cloudflare Workers due to an SSL handshake issue on Alchemy's infrastructure.
// These are used as fallbacks when the primary Alchemy provider fails.
export const fallbackProvider = (networkId: string): string | undefined => {
  return {
    '43114': 'https://api.avax.network/ext/bc/C/rpc',
    '56': 'https://bsc-dataseed.binance.org/',
    '324': 'https://mainnet.era.zksync.io',
    '42220': 'https://forno.celo.org',
    '534352': 'https://rpc.scroll.io',
  }[networkId]
}

// This is the list of networks currently supported
const supportedNetworks = (env: Env, networkId: string): string | undefined => {
  return {
    '1': env.MAINNET_PROVIDER,
    '10': env.OPTIMISM_PROVIDER,
    '56': env.BSC_PROVIDER,
    '100': env.GNOSIS_PROVIDER,
    '137': env.POLYGON_PROVIDER,
    '324': env.ZKSYNC_PROVIDER,
    '1101': env.ZKEVM_PROVIDER,
    '42161': env.ARBITRUM_PROVIDER,
    '42220': env.CELO_PROVIDER,
    '43114': env.AVALANCHE_PROVIDER,
    '84532': env.BASE_SEPOLIA_PROVIDER,
    '8453': env.BASE_PROVIDER,
    '11155111': env.SEPOLIA_PROVIDER,
    '59144': env.LINEA_PROVIDER,
    '534352': env.SCROLL_PROVIDER,
  }[networkId]
}

export default supportedNetworks
