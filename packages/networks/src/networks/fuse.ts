import { NetworkConfig } from '@unlock-protocol/types'

export const fuse: NetworkConfig = {
  blockScan: {
    url: (address: string) => `https://blockscan.com/address/${address}`,
  },
  chain: 'fuse',
  description: 'A public testnet for Fuse.',
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
  fullySubsidizedGas: true,
  hooks: {},
  id: 122,
  isTestNetwork: false,
  keyManagerAddress: '',
  maxFreeClaimCost: 1000,
  multisig: '',
  name: 'Fuse Mainnet',
  nativeCurrency: {
    coingecko: 'ethereum',
    decimals: 18,
    name: 'FUSE',
    symbol: 'FUSE',
  },

  previousDeploys: [],

  provider: 'https://rpc.fuse.io/',

  publicLockVersionToDeploy: 14,

  publicProvider: 'https://rpc.fuse.io/',

  startBlock: 0,
  subgraph: {
    endpoint: '<>', // this is given to you by the graph after deploying
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
  unlockAddress: '',
  unlockDaoToken: {
    address: '',
  },
}

export default fuse
