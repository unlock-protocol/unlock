import { HookType, NetworkConfig } from '@unlock-protocol/types'

export const degenChain: NetworkConfig = {
  blockScan: {
    url: (address: string) => `https://blockscan.com/address/${address}`,
  },
  chain: 'degen',
  description:
    'Degen Chain is a Layer 3 blockchain built on Base, an Ethereum Layer 2 solution, for developing crypto projects for its community.',
  featured: false,
  hooks: {
    onKeyPurchaseHook: [
      {
        address: '0x246b87d54f3ad4d615cfb41d149222101bc87daD',
        id: HookType.PASSWORD,
        name: 'Password Hook',
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

  unlockAddress: '0x74771a16f1571A0D68D01058E0a1A9C38b295D7d',
}

export default degenChain
