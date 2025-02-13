import { NetworkConfig } from '@unlock-protocol/types'

export const garnet: NetworkConfig = {
  blockScan: {
    url: (address: string) =>
      `https://explorer.garnetchain.com/address/${address}`,
  },
  chain: 'garnet',
  description: 'Garnet Testnet is the Testnet for Redstone OP Plasma L2',
  explorer: {
    name: 'Garnetchain',
    urls: {
      address: (address) =>
        `https://explorer.garnetchain.com/address/${address}/transactions`,
      base: `https://explorer.garnetchain.com/`,
      token: (address, holder) =>
        `https://explorer.garnetchain.com/token/${address}?a=${holder}`,
      transaction: (hash) => `https://explorer.garnetchain.com/tx/${hash}`,
    },
  },
  featured: true,
  id: 17069,
  isTestNetwork: true,
  maxFreeClaimCost: 100,
  name: 'Garnet Testnet',
  nativeCurrency: {
    coingecko: 'ethereum',
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  previousDeploys: [],
  provider: 'https://rpc.garnetchain.com',
  publicLockVersionToDeploy: 14,
  publicProvider: 'https://rpc.garnetchain.com',
  startBlock: 7854281,
  // This is used in llama pricing API so can't rename.
  subgraph: {
    endpoint: '<>',
    graphId: '2Pr7V4721iZj5hRgLmuganYCTRee6fqqfftLCFCd72wG',
    networkName: 'garnet-testnet',
    studioName: 'unlock-protocol-garnet-testnet',
  },
  tokens: [
    {
      address: '0xb9039385a5c5fFf6C0794829c3149690b310ec8a',
      decimals: 18,
      featured: true,
      name: 'EVE',
      symbol: 'EVE',
    },
    {
      address: '0x227517bfb7846827831744461fECb1234C66f65a',
      decimals: 18,
      featured: true,
      name: 'EVE (sandbox)',
      symbol: 'EVE',
    },
  ],
  unlockAddress: '0x839fdccb5bf005cbdd84dd2700fbd9B64bd94772',
  url: 'https://garnetchain.com/',
}
export default garnet
