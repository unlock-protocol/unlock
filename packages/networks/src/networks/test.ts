import { NetworkConfig } from '@unlock-protocol/types'

export const test: NetworkConfig = {
  chain: 'test',
  description: 'some tesnet',
  featured: false,

  nativeCurrency: {
    decimals: 18,
    name: 'Test ETH',
    symbol: 'ETH',
  },
  provider: 'http://localhost:8545',
  // publicLockVersionToDeploy: 14,
  publicProvider: 'http://localhost:8545',
  subgraph: {
    endpoint: 'hah',
  },
  unlockAddress: '',
}

export default test
