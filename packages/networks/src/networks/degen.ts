import { HookType, NetworkConfig } from '@unlock-protocol/types'

export const degenChain: NetworkConfig = {
  blockScan: {
    url: (address: string) => `https://blockscan.com/address/${address}`,
  },
  chain: 'DEGEN',
  description: 'DEGEN CHAIN L3',
  featured: false,
  hooks: {
    onKeyPurchaseHook: [
      {
        address: '0xC4E6FDfe46CD1DF46801e080000a4897c42Fd75F',
        id: HookType.PASSWORD_CAPPED,
        name: 'Passwords with caps. Multiple passwords can be used per contract',
      },
    ],
  },
  id: 666666666,
  isTestNetwork: false,
  name: 'DEGEN Chain',
  nativeCurrency: {
    coingecko: 'DEGEN',
    decimals: 18,
    name: 'DEGEN',
    symbol: 'DEGEN',
  },
  previousDeploys: [],
  provider: 'https://nitrorpc-degen-mainnet-1.t.conduit.xyz',
  publicLockVersionToDeploy: 13,
  publicProvider: 'https://nitrorpc-degen-mainnet-1.t.conduit.xyz',
  subgraph: {
    endpoint: '',
    studioName: '',
  },

  unlockAddress: '',
}

export default degenChain
