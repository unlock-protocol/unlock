import { HookType, NetworkConfig } from '@unlock-protocol/types'

export const bsc: NetworkConfig = {
  publicProvider: 'https://bsc-dataseed.binance.org/',
  provider: 'https://rpc.unlock-protocol.com/56',
  unlockAddress: '0xeC83410DbC48C7797D2f2AFe624881674c65c856',
  keyManagerAddress: '0x34EbEc0AE80A2d078DE5489f0f5cAa4d3aaEA355',
  id: 56,
  name: 'BNB Chain',
  chain: 'bsc',
  multisig: '0x373D7cbc4F2700719DEa237500c7a154310B0F9B',
  subgraph: {
    endpoint: 'https://api.thegraph.com/subgraphs/name/unlock-protocol/bsc',
    endpointV2:
      'https://api.thegraph.com/subgraphs/name/unlock-protocol/bsc-v2',
  },
  explorer: {
    name: 'BscScan',
    urls: {
      base: `https://bscscan.com/`,
      address: (address) => `https://bscscan.com/address/${address}`,
      transaction: (hash) => `https://bscscan.com/tx/${hash}`,
      token: (address, holder) =>
        `https://bscscan.com/token/${address}?a=${holder}`,
    },
  },
  opensea: {
    tokenUrl: (_lockAddress, _tokenId) => null,
  },
  nativeCurrency: {
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18,
    coingecko: 'binancecoin',
  },
  startBlock: 13079000, // 12368889,
  previousDeploys: [
    {
      unlockAddress: '0x99b1348a9129ac49c6de7F11245773dE2f51fB0c',
      startBlock: 12396000,
    },
  ],
  description:
    'The best-performing EVM compatible layer 1. Fully compatible tooling for EVM with up to 35 times of capacity.',
  url: 'https://www.bnbchain.org/en',
  isTestNetwork: false,
  maxFreeClaimCost: 1,
  swapPurchaser: '0x5Ad19758103D474bdF5E8764D97cB02b83c3c844',
  tokens: [
    {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
      address: '0x2170ed0880ac9a755fd29b2688956bd959f933f8',
    },
    {
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 18,
      address: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
    },
    {
      name: 'Tether',
      symbol: 'USDT',
      decimals: 18,
      address: '0x55d398326f99059ff775485246999027b3197955',
    },
    {
      name: 'Dai',
      symbol: 'DAI',
      decimals: 18,
      address: '0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3',
    },
  ],
  hooks: {
    onKeyPurchaseHook: [
      {
        id: HookType.PASSWORD,
        name: 'Password required',
        address: '0x338b1f296217485bf4df6CE9f93ab4C73F72b57D',
      },
      {
        id: HookType.CAPTCHA,
        name: 'Captcha',
        address: '0x88ed81de2d62849B337c3f31cd84D041bF26A38C',
      },
    ],
  },
}

export default bsc
