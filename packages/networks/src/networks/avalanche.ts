import { HookType, NetworkConfig } from '@unlock-protocol/types'

export const avalanche: NetworkConfig = {
  publicProvider: 'https://api.avax.network/ext/bc/C/rpc',
  provider: 'https://rpc.unlock-protocol.com/43114',
  unlockAddress: '0x70cBE5F72dD85aA634d07d2227a421144Af734b3',
  multisig: '0xEc7777C51327917fd2170c62873272ea168120Cb',
  keyManagerAddress: '0x8e0B46ec3B95c81355175693dA0083b00fCc1326',
  id: 43114,
  name: 'Avalanche (C-Chain)',
  chain: 'avax',
  subgraph: {
    endpoint:
      'https://api.thegraph.com/subgraphs/name/unlock-protocol/avalanche',
    endpointV2:
      'https://api.thegraph.com/subgraphs/name/unlock-protocol/avalanche-v2',
  },
  explorer: {
    name: 'Snowtrace (Avalanche)',
    urls: {
      base: `https://snowtrace.io/`,
      address: (address) => `https://snowtrace.io/address/${address}`,
      transaction: (hash) => `https://snowtrace.io/tx/${hash}`,
      token: (address, holder) =>
        `https://snowtrace.io/token/${address}?a=${holder}`,
    },
  },
  opensea: {
    tokenUrl: (_lockAddress, _tokenId) => null,
  },
  nativeCurrency: {
    name: 'AVAX',
    symbol: 'AVAX',
    decimals: 18,
    coingecko: 'avalanche-2',
  },
  startBlock: 17188332,
  previousDeploys: [],
  isTestNetwork: false,
  maxFreeClaimCost: 1,
  description:
    'Avalanche is an open, programmable smart contracts platform for decentralized applications.',
  url: 'https://www.avalabs.org/',
  tokens: [
    {
      name: 'Ethereum',
      symbol: 'WETH',
      decimals: 18,
      address: '0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab',
    },
    {
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6,
      address: '0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664',
    },
    {
      name: 'Tether',
      symbol: 'USDT',
      decimals: 6,
      address: '0xc7198437980c041c805a1edcba50c1ce5db95118',
    },
    {
      name: 'Dai',
      symbol: 'DAI',
      decimals: 18,
      address: '0xd586e7f844cea2f87f50152665bcbc2c279d8d70',
    },
    {
      name: 'Wrapped Bitcoin',
      symbol: 'WBTC',
      decimals: 8,
      address: '0x50b7545627a5162f82a992c33b87adc75187b218',
    },
  ],
  hooks: {
    onKeyPurchaseHook: [
      {
        id: HookType.CAPTCHA,
        name: 'Captcha',
        address: '0x2499D94880B30fA505543550ac8a1e24cfFeFe78',
      },
    ],
  },
}

export default avalanche
