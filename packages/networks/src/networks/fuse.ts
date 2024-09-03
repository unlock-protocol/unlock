import { NetworkConfig } from '@unlock-protocol/types'

export const fuse: NetworkConfig = {
  chain: 'fuse',
  description: 'Fuse is an EVM-compatible Layer-1 blockchain.',
  explorer: {
    name: 'Fuse Explorer',
    urls: {
      address: (address: string) =>
        `https://explorer.fuse.io/address/${address}`,
      base: `https://explorer.fuse.io/`,
      token: (address: string, holder: string) =>
        `https://explorer.fuse.io/token/${address}?a=${holder}`,
      transaction: (hash: string) => `https://explorer.fuse.io/tx/${hash}`,
    },
  },
  featured: false,
  fullySubsidizedGas: false,
  hooks: {},
  id: 122,
  isTestNetwork: false,
  keyManagerAddress: '',
  maxFreeClaimCost: 0,
  multisig: '0x5ED353B723847E0317a59aE224613C399a4D0d8c',
  name: 'Fuse Mainnet',
  nativeCurrency: {
    coingecko: 'fuse',
    decimals: 18,
    name: 'FUSE',
    symbol: 'FUSE',
    wrapped: '0x0BE9e53fd7EDaC9F859882AfdDa116645287C629',
  },

  previousDeploys: [],

  provider: 'https://rpc.fuse.io/',

  publicLockVersionToDeploy: 14,

  publicProvider: 'https://rpc.fuse.io/',

  startBlock: 31355828,
  subgraph: {
    endpoint:
      'https://api.studio.thegraph.com/query/87693/unlock-protocol-fuse/version/latest', // this is given to you by the graph after deploying
    networkName: 'fuse', // the graph name of the network see https://thegraph.com/docs/en/developing/supported-networks/
    studioName: 'unlock-protocol-fuse', // the name of the graph
  },
  tokens: [
    {
      address: '0x5622F6dC93e08a8b717B149677930C38d5d50682',
      decimals: 18,
      featured: true,
      name: 'Wrapped Ether',
      symbol: 'WETH',
    },
    {
      address: '0x28C3d1cD466Ba22f6cae51b1a4692a831696391A',
      decimals: 6,
      featured: true,
      name: 'USD Coin',
      symbol: 'USDC',
    },
  ],
  unlockAddress: '0xbf36B2a6dd0019555A33602Bf04e2882b0cEc843',
  unlockDaoToken: {
    address: '',
  },
}

export default fuse
