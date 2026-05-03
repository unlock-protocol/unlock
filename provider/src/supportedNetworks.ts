import { Env } from './types'
import networks from '@unlock-protocol/networks'

// 1RPC endpoints as level 2 fallback — not on Cloudflare CDN, no API key required.
// 84532 (Base Sepolia) is intentionally omitted — 1RPC does not support it.
// When adding a new chain to supportedNetworks, add its 1RPC URL here if available:
// https://docs.1rpc.io/overview/supported-networks
// Note: these are static strings and should be reviewed periodically in case 1RPC changes endpoint paths.
export const oneRpcEndpoints: Record<string, string> = {
  '1': 'https://1rpc.io/eth',
  '10': 'https://1rpc.io/op',
  '56': 'https://1rpc.io/bnb',
  '100': 'https://1rpc.io/gnosis',
  '137': 'https://1rpc.io/matic',
  '324': 'https://1rpc.io/zksync2-era',
  '1101': 'https://1rpc.io/polygon/zkevm',
  '42161': 'https://1rpc.io/arb',
  '42220': 'https://1rpc.io/celo',
  '43114': 'https://1rpc.io/avax/c',
  '8453': 'https://1rpc.io/base',
  '11155111': 'https://1rpc.io/sepolia',
  '59144': 'https://1rpc.io/linea',
  '534352': 'https://1rpc.io/scroll',
}

// Returns ordered fallback URLs to try when the primary Alchemy provider fails.
// Level 1: official public RPC from the @unlock-protocol/networks package
// Level 2: 1RPC (not on Cloudflare CDN, avoids SSL handshake issues)
export const getFallbackProviders = (networkId: string): string[] => {
  const fallbacks: string[] = []

  const network = networks[networkId]
  if (network?.publicProvider) {
    fallbacks.push(network.publicProvider)
  }

  const oneRpcUrl = oneRpcEndpoints[networkId]
  if (oneRpcUrl) {
    fallbacks.push(oneRpcUrl)
  }

  return fallbacks
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
