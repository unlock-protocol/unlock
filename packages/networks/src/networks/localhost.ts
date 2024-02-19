import { NetworkConfig } from '@unlock-protocol/types'

// We use Partial<NetworkConfig> for localhost as we don't have all the information
export const localhost: Partial<NetworkConfig> = {
  chain: 'localhost',
  description: 'Localhost network.',
  featured: false,
  fullySubsidizedGas: true,
  id: 31337,
  isTestNetwork: true,
  name: 'localhost',
  nativeCurrency: {
    coingecko: 'ethereum',
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
  },
  provider: 'http://127.0.0.1:8545',
  publicLockVersionToDeploy: 13,
  publicProvider: 'http://127.0.0.1:8545',
  subgraph: {
    endpoint: 'http://localhost:8000/subgraphs/name/unlock-protocol/unlock',
  },
}
