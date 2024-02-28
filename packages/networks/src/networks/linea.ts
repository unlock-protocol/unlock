import { HookType, NetworkConfig } from '@unlock-protocol/types'

export const linea: NetworkConfig = {
  blockScan: {
    url: (address: string) => `https://blockscan.com/address/${address}`,
  },
  chain: 'linea',
  description:
    'Linea a Layer 2 zk-Rollup EVM-compatible chain powered by ConsenSys.',
  explorer: {
    name: 'Linea',
    urls: {
      address: (address: string) =>
        `https://lineascan.build/address/${address}`,
      base: `https://lineascan.build/`,
      token: (address: string, holder: string) =>
        `https://lineascan.build/token/${address}?a=${holder}`,
      transaction: (hash: string) => `https://lineascan.build/tx/${hash}`,
    },
  },
  featured: false,
  hooks: {
    onKeyPurchaseHook: [
      {
        address: '0x6878Ae3c863f6Ebd27B47C02F6B32aAC8B0BA07E',
        id: HookType.PASSWORD,
        name: 'Password required',
      },
      {
        address: '0x8c5D54B2CAA4C2D08B0DDF82a1e6D2641779B8EC',
        id: HookType.CAPTCHA,
        name: 'Captcha',
      },
      {
        address: '0xaE8F3F0826A39122401ED634f0a5C19549331432',
        id: HookType.GUILD,
        name: 'Guild',
      },
      {
        address: '0xCD9C9b40D757b56359e19563203D3bc64089638d',
        id: HookType.PROMOCODE,
        name: 'Discount code',
      },
      {
        address: '0x4Bf912519549DF750002814a2DcE7184b3971F06',
        id: HookType.PROMO_CODE_CAPPED,
        name: 'Discount code with caps',
      },
    ],
  },
  id: 59144,

  isTestNetwork: false,

  keyManagerAddress: '0x338b1f296217485bf4df6CE9f93ab4C73F72b57D',

  maxFreeClaimCost: 10,

  // multisig: '', // TODO

  name: 'Linea',

  nativeCurrency: {
    coingecko: 'linea-eth',
    decimals: 18,
    name: 'Linea Ether',
    symbol: 'ETH',
  },
  previousDeploys: [],
  provider: 'https://rpc.unlock-protocol.com/59144',
  publicLockVersionToDeploy: 13,
  publicProvider: 'https://rpc.linea.build/',
  startBlock: 560908,
  subgraph: {
    endpoint:
      'https://api.studio.thegraph.com/query/65299/unlock-protocol-linea/version/latest',
    studioName: 'unlock-protocol-linea',
  },
  tokens: [
    {
      address: '0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f',
      decimals: 18,
      featured: true,
      name: 'Wrapped Ether',
      symbol: 'WETH',
    },
    {
      address: '0x4AF15ec2A0BD43Db75dd04E62FAA3B8EF36b00d5',
      decimals: 18,
      featured: true,
      name: 'Dai Stablecoin',
      symbol: 'DAI',
    },
    {
      address: '0xA219439258ca9da29E9Cc4cE5596924745e12B93',
      decimals: 6,
      featured: true,
      name: 'Tether USD',
      symbol: 'USDT',
    },
    {
      address: '0x176211869cA2b568f2A7D4EE941E073a821EE1ff',
      decimals: 6,
      featured: true,
      name: 'USDC',
      symbol: 'USDC',
    },
    {
      address: '0x3aAB2285ddcDdaD8edf438C1bAB47e1a9D05a9b4',
      decimals: 8,
      featured: true,
      name: 'Wrapped BTC',
      symbol: 'WBTC',
    },
  ],
  // uniswapV3: {},
  // universalCard: {},
  unlockAddress: '0x70B3c9Dd9788570FAAb24B92c3a57d99f8186Cc7',
  url: 'https://linea.build/',
}

export default linea
