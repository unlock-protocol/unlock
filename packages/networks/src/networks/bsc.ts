import { HookType, NetworkConfig } from '@unlock-protocol/types'

export const bsc: NetworkConfig = {
  blockScan: {
    url: (address: string) => `https://blockscan.com/address/${address}`,
  },
  chain: 'bsc',
  description:
    'The best-performing EVM compatible layer 1. Fully compatible tooling for EVM with up to 35 times of capacity.',
  explorer: {
    name: 'BscScan',
    urls: {
      address: (address) => `https://bscscan.com/address/${address}`,
      base: `https://bscscan.com/`,
      token: (address, holder) =>
        `https://bscscan.com/token/${address}?a=${holder}`,
      transaction: (hash) => `https://bscscan.com/tx/${hash}`,
    },
  },
  featured: false,
  governanceBridge: {
    connext: '0xCd401c10afa37d641d2F594852DA94C700e4F2CE',
    domainId: 6450786,
    modules: {
      connextMod: '0x36b34e10295cCE69B652eEB5a8046041074515Da',
      delayMod: '0xcf07c951C44731f82E548286C7ebeC576149a49e',
    },
  },
  hooks: {
    onKeyPurchaseHook: [
      {
        address: '0x338b1f296217485bf4df6CE9f93ab4C73F72b57D',
        id: HookType.PASSWORD,
        name: 'Password required',
      },
      {
        address: '0x80E085D7591C61153D876b5171dc25756a7A3254',
        id: HookType.CAPTCHA,
        name: 'Captcha',
      },
      {
        address: '0xF6963D3c395A7914De77f771C2fC44b47B8379AC',
        id: HookType.GUILD,
        name: 'Guild',
      },
    ],
  },
  id: 56,
  isTestNetwork: false,
  keyManagerAddress: '0x34EbEc0AE80A2d078DE5489f0f5cAa4d3aaEA355',
  maxFreeClaimCost: 1,
  multisig: '0x373D7cbc4F2700719DEa237500c7a154310B0F9B',
  name: 'BNB Chain',
  nativeCurrency: {
    coingecko: 'binancecoin',
    decimals: 18,
    name: 'BNB',
    symbol: 'BNB',
    wrapped: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
  },
  opensea: {
    collectionUrl: (lockAddress) =>
      `https://opensea.io/assets/bsc/${lockAddress}`,
    tokenUrl: (_lockAddress, _tokenId) =>
      `https://opensea.io/assets/bsc/${_lockAddress}/${_tokenId}`,
  },

  previousDeploys: [
    {
      startBlock: 12396000,
      unlockAddress: '0x99b1348a9129ac49c6de7F11245773dE2f51fB0c',
    },
  ],

  provider: 'https://rpc.unlock-protocol.com/56',

  publicLockVersionToDeploy: 13,

  publicProvider: 'https://bsc-dataseed.binance.org/',

  startBlock: 13079000,

  subgraph: {
    endpoint: 'https://api.thegraph.com/subgraphs/name/unlock-protocol/bsc',
    endpointV2:
      'https://api.thegraph.com/subgraphs/name/unlock-protocol/bsc-v2',
  },

  swapPurchaser: '0x5Ad19758103D474bdF5E8764D97cB02b83c3c844',

  tokens: [
    {
      address: '0x2170ed0880ac9a755fd29b2688956bd959f933f8',
      decimals: 18,
      featured: true,
      name: 'Ethereum',
      symbol: 'ETH',
    },
    {
      address: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
      decimals: 18,
      featured: true,
      name: 'USD Coin',
      symbol: 'USDC',
    },
    {
      address: '0x55d398326f99059ff775485246999027b3197955',
      decimals: 18,
      featured: true,
      name: 'Tether',
      symbol: 'USDT',
    },
    {
      address: '0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3',
      decimals: 18,
      featured: true,
      name: 'Dai',
      symbol: 'DAI',
    },
  ],
  uniswapV3: {
    factoryAddress: '0xdB1d10011AD0Ff90774D0C6Bb92e5C5c8b4461F7',
    positionManager: '0x7b8A01B39D58278b5DE7e48c8449c9f4F5170613',
    universalRouterAddress: '0x5302086A3a25d473aAbBd0356eFf8Dd811a4d89B',
  },
  unlockAddress: '0xeC83410DbC48C7797D2f2AFe624881674c65c856',
  url: 'https://www.bnbchain.org/en',
}

export default bsc
