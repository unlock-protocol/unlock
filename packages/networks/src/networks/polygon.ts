import { HookType, NetworkConfig } from '@unlock-protocol/types'

export const polygon: NetworkConfig = {
  featured: true,
  publicProvider: 'https://polygon-rpc.com/',
  provider: 'https://rpc.unlock-protocol.com/137',
  unlockAddress: '0xE8E5cd156f89F7bdB267EabD5C43Af3d5AF2A78f',
  multisig: '0x479f3830fbd715342868BA95E438609BCe443DFB',
  serializerAddress: '0x646e373eaf8a4aec31bf62b7fd6fb59296d6cda9',
  keyManagerAddress: '0x7111a1aDfbED501beaAd556Bba7cB6dCa3296aa9',
  id: 137,
  name: 'Polygon',
  chain: 'polygon',
  subgraph: {
    endpoint: 'https://api.thegraph.com/subgraphs/name/unlock-protocol/polygon',
    endpointV2:
      'https://api.thegraph.com/subgraphs/name/unlock-protocol/polygon-v2',
    networkName: 'matic',
  },
  url: 'https://polygon.technology/',
  explorer: {
    name: 'Polygonscan',
    urls: {
      base: `https://polygonscan.com/`,
      address: (address) => `https://polygonscan.com/address/${address}`,
      transaction: (hash) => `https://polygonscan.com/tx/${hash}`,
      token: (address, holder) =>
        `https://polygonscan.com/token/${address}?a=${holder}`,
    },
  },
  opensea: {
    tokenUrl: (lockAddress, tokenId) =>
      `https://opensea.io/assets/matic/${lockAddress}/${tokenId}`,
    collectionUrl: (lockAddress) =>
      `https://opensea.io/assets/matic/${lockAddress}`,
  },
  nativeCurrency: {
    name: 'Matic',
    symbol: 'MATIC',
    decimals: 18,
    coingecko: 'matic-network',
  },
  startBlock: 21986688,
  previousDeploys: [
    {
      unlockAddress: '0x14bb3586Ce2946E71B95Fe00Fc73dd30ed830863',
      startBlock: 15714206,
    },
  ],
  description:
    "Polygon is a side-chain to build and scale your projects on Ethereum, the world's largest blockchain ecosystem.",
  isTestNetwork: false,
  maxFreeClaimCost: 100,
  uniswapV2: {
    oracle: '0xE20ef269CE3ac2Af8107E706FC2Ec6E1831e3125',
  },
  uniswapV3: {
    factoryAddress: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
    quoterAddress: '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6',
    oracle: '0xE77c7F14e8EB9925ca418bF80c0a81a5B9C87683',
  },
  swapPurchaser: '0x33aC9CAE1Cd9CBB191116607f564F7381d81BAD9',
  wrappedNativeCurrency: {
    name: 'Wrapped MATIC',
    symbol: 'WMATIC',
    decimals: 18,
    address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
  },
  tokens: [
    {
      name: 'Wrapped Ether',
      address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
      symbol: 'WETH',
      decimals: 18,
    },
    {
      name: 'Dai Stablecoin',
      address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
      symbol: 'DAI',
      decimals: 18,
    },

    {
      name: 'Tether USD',
      address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      symbol: 'USDT',
      decimals: 6,
    },
    {
      name: 'USD Coin',
      address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      symbol: 'USDC',
      decimals: 6,
    },
    {
      name: 'Wrapped BTC',
      address: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',
      symbol: 'WBTC',
      decimals: 8,
    },
  ],
  hooks: {
    onKeyPurchaseHook: [
      {
        id: HookType.PASSWORD,
        name: 'Password required',
        address: '0x9F4AE507d7E91Ab37CF35f792940fE079bd4E24d',
      },
      {
        id: HookType.CAPTCHA,
        name: 'Captcha',
        address: '0xA0863a0B58457A86c937e91533e3F6B8dA27cf4b',
      },
    ],
  },
}

export default polygon
