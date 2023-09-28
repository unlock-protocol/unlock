import { HookType, NetworkConfig } from '@unlock-protocol/types'

export const avalanche: NetworkConfig = {
  blockScan: {
    url: (address: string) => `https://blockscan.com/address/${address}`,
  },
  chain: 'avax',
  description:
    'Avalanche is an open, programmable smart contracts platform for decentralized applications.',
  explorer: {
    name: 'Snowtrace (Avalanche)',
    urls: {
      address: (address) => `https://snowtrace.io/address/${address}`,
      base: `https://snowtrace.io/`,
      token: (address, holder) =>
        `https://snowtrace.io/token/${address}?a=${holder}`,
      transaction: (hash) => `https://snowtrace.io/tx/${hash}`,
    },
  },
  featured: false,
  hooks: {
    onKeyPurchaseHook: [
      {
        address: '0xF57a29012Bc367a6FDBB0Aead9A8909Ce15a8aCf',
        id: HookType.PASSWORD,
        name: 'Password required',
      },
      
      {
        address: '0x2499D94880B30fA505543550ac8a1e24cfFeFe78',
        id: HookType.CAPTCHA,
        name: 'Captcha',
      },
    ],
  },
  id: 43114,
  isTestNetwork: false,
  keyManagerAddress: '0x8e0B46ec3B95c81355175693dA0083b00fCc1326',
  maxFreeClaimCost: 1,
  multisig: '0xEc7777C51327917fd2170c62873272ea168120Cb',
  name: 'Avalanche (C-Chain)',
  nativeCurrency: {
    coingecko: 'avalanche-2',
    decimals: 18,
    name: 'AVAX',
    symbol: 'AVAX',
  },
  opensea: {
    tokenUrl: (_lockAddress, _tokenId) => null,
  },
  previousDeploys: [],
  provider: 'https://rpc.unlock-protocol.com/43114',
  publicLockVersionToDeploy: 13,
  publicProvider: 'https://api.avax.network/ext/bc/C/rpc',
  startBlock: 17188332,
  subgraph: {
    endpoint:
      'https://api.thegraph.com/subgraphs/name/unlock-protocol/avalanche',
    endpointV2:
      'https://api.thegraph.com/subgraphs/name/unlock-protocol/avalanche-v2',
  },
  tokens: [
    {
      address: '0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab',
      decimals: 18,
      name: 'Ethereum',
      symbol: 'WETH',
    },
    {
      address: '0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664',
      decimals: 6,
      name: 'USD Coin',
      symbol: 'USDC',
    },
    {
      address: '0xc7198437980c041c805a1edcba50c1ce5db95118',
      decimals: 6,
      name: 'Tether',
      symbol: 'USDT',
    },
    {
      address: '0xd586e7f844cea2f87f50152665bcbc2c279d8d70',
      decimals: 18,
      name: 'Dai',
      symbol: 'DAI',
    },
    {
      address: '0x50b7545627a5162f82a992c33b87adc75187b218',
      decimals: 8,
      name: 'Wrapped Bitcoin',
      symbol: 'WBTC',
    },
  ],
  unlockAddress: '0x70cBE5F72dD85aA634d07d2227a421144Af734b3',
  url: 'https://www.avalabs.org/',
}

export default avalanche
