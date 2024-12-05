import { HookType, NetworkConfig } from '@unlock-protocol/types'

export const linea: NetworkConfig = {
  blockScan: {
    url: (address: string) => `https://blockscan.com/address/${address}`,
  },
  chain: 'linea',
  dao: {
    chainId: 8453,
    governanceBridge: {
      connext: '0xa05eF29e9aC8C75c530c2795Fa6A800e188dE0a9',
      domainId: 1818848877,
      modules: {
        connextMod: '0x1b6ED52be06Cef3b9eD234114843BE79971e51f3',
        delayMod: '0x2D4123dB5A4d3bAA2DbeA4cB10333a9E3271292a',
      },
    },
    governor: '0x65bA0624403Fc5Ca2b20479e9F626eD4D78E0aD9',
  },
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
        address: '0x04664b4290fa1F4001ED25d9576f7C2d980aC64d',
        id: HookType.PROMO_CODE_CAPPED,
        name: 'Discount code with caps',
      },
      {
        address: '0xD925Ac2887Ba4372849F0fd64217A6749552bb21',
        id: HookType.PASSWORD_CAPPED,
        name: 'Passwords with caps. Multiple passwords can be used per contract',
      },
      {
        address: '0x15922b77301Df5EA532074e9fb30d115FB6A03fE',
        id: HookType.ALLOW_LIST,
        name: 'Allow List',
      },
    ],
  },
  id: 59144,

  isTestNetwork: false,

  keyManagerAddress: '0x338b1f296217485bf4df6CE9f93ab4C73F72b57D',

  maxFreeClaimCost: 10,

  multisig: '0x0b441f6A255a56670B6fdb37B527e091a394eeB9',

  name: 'Linea',

  nativeCurrency: {
    coingecko: 'ethereum',
    decimals: 18,
    name: 'Linea Ether',
    symbol: 'ETH',
  },
  previousDeploys: [],
  provider: 'https://rpc.linea.build/',
  publicLockVersionToDeploy: 14,
  publicProvider: 'https://rpc.linea.build/',
  startBlock: 560908,
  subgraph: {
    endpoint: 'https://subgraph.unlock-protocol.com/59144',
    graphId: '3G85noAfEa4jYGPmrvzzBTY55abu2kVgXnfWwRq3absq',
    studioName: 'unlock-protocol-linea',
  },
  tokens: [
    {
      address: '0x176211869cA2b568f2A7D4EE941E073a821EE1ff',
      decimals: 6,
      featured: true,
      name: 'USDC',
      symbol: 'USDC',
    },
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
