import { NetworkConfig } from '@unlock-protocol/types'

export const core: NetworkConfig = {
  chain: 'core',
  description:
    'Build with EVM-compatible smart contracts on a Bitcoin-powered blockchain',
  explorer: {
    name: 'Core Explorer',
    urls: {
      address: (address) => `https://scan.coredao.org/address/${address}`,
      base: 'https://scan.coredao.org/',
      token: (address, holder) =>
        `https://scan.coredao.org/token/${address}?a=${holder}`,
      transaction: (hash) => `https://scan.coredao.org/tx/${hash}`,
    },
  },
  featured: false,
  id: 1116,
  isTestNetwork: false,
  multisig: '0x0eCbE42d1B8c9e56a9d358D3Ac1b5aaFAf5f07d5',
  name: 'Core',
  nativeCurrency: {
    coingecko: 'CORE',
    decimals: 18,
    name: 'CORE',
    symbol: 'CORE',
    wrapped: '0x40375C92d9FAf44d2f9db9Bd9ba41a3317a2404f',
  },
  provider: 'https://rpc.coredao.org/',
  publicLockVersionToDeploy: 14,
  publicProvider: 'https://rpc.coredao.org/',
  startBlock: undefined,
  subgraph: {
    endpoint: 'https://thegraph.coredao.org',
    networkName: 'core',
    // studioName: 'unlock-protocol-core',
  },
  tokens: [
    {
      address: '0x40375C92d9FAf44d2f9db9Bd9ba41a3317a2404f',
      decimals: 18,
      featured: true,
      name: 'Wrapped Core',
      symbol: 'WCORE',
    },
  ],
  unlockAddress: 'TODO',
  url: 'https://coredao.org',
}

export default core
