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
  provider: 'https://rpc2.sepolia.org/',
  // publicLockVersionToDeploy: 14,
  publicProvider: 'http://localhost:8545',
  subgraph: {
    endpoint: 'hah',
  },
  unlockAddress: '0x36b34e10295cCE69B652eEB5a8046041074515Da',
}

export default test
