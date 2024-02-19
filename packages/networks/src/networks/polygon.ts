import { HookType, NetworkConfig } from '@unlock-protocol/types'

export const polygon: NetworkConfig = {
  blockScan: {
    url: (address: string) => `https://blockscan.com/address/${address}`,
  },
  chain: 'polygon',
  description:
    "Polygon is a side-chain to build and scale your projects on Ethereum, the world's largest blockchain ecosystem.",
  explorer: {
    name: 'Polygonscan',
    urls: {
      address: (address: string) =>
        `https://polygonscan.com/address/${address}`,
      base: `https://polygonscan.com/`,
      token: (address: string, holder: string) =>
        `https://polygonscan.com/token/${address}?a=${holder}`,
      transaction: (hash: string) => `https://polygonscan.com/tx/${hash}`,
    },
  },
  featured: true,
  governanceBridge: {
    connext: '0x11984dc4465481512eb5b777E44061C158CF2259',
    domainId: 1886350457,
    modules: {
      connextMod: '0xa8E0FD3D023B1A253eF52B6169851Ee95eF257bE',
      delayMod: '0x31B8bB0BC5ffEe8e476202e9D97b0b8c31aA767d',
    },
  },
  hooks: {
    onKeyPurchaseHook: [
      {
        address: '0x9F4AE507d7E91Ab37CF35f792940fE079bd4E24d',
        id: HookType.PASSWORD,
        name: 'Password required',
      },
      {
        address: '0x64bDe27046F915e2BAb6339Ce4f737E34474344d',
        id: HookType.CAPTCHA,
        name: 'Captcha',
      },
      {
        address: '0xBfF080aB4600554c1e8c390d2e070CF423767B64',
        id: HookType.GUILD,
        name: 'Guild',
      },
      {
        address: '0x93E160838c529873cB7565106bBb79a3226FE07A',
        id: HookType.PROMOCODE,
        name: 'Discount code',
      },
      {
        address: '0xa10a55EF6E41dE1267cA8A98010B58a7b6B21418',
        id: HookType.PROMO_CODE_CAPPED,
        name: 'Discount code with caps',
      },
    ],
  },
  id: 137,
  isTestNetwork: false,
  keyManagerAddress: '0x7111a1aDfbED501beaAd556Bba7cB6dCa3296aa9',
  maxFreeClaimCost: 100,
  multisig: '0x479f3830fbd715342868BA95E438609BCe443DFB',
  name: 'Polygon',
  nativeCurrency: {
    coingecko: 'matic-network',
    decimals: 18,
    name: 'Matic',
    symbol: 'MATIC',
    wrapped: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
  },
  opensea: {
    collectionUrl: (lockAddress: string) =>
      `https://opensea.io/assets/matic/${lockAddress}`,
    tokenUrl: (lockAddress: string, tokenId: string) =>
      `https://opensea.io/assets/matic/${lockAddress}/${tokenId}`,
  },
  previousDeploys: [
    {
      startBlock: 15714206,
      unlockAddress: '0x14bb3586Ce2946E71B95Fe00Fc73dd30ed830863',
    },
  ],
  provider: 'https://rpc.unlock-protocol.com/137',
  publicLockVersionToDeploy: 13,
  publicProvider: 'https://polygon-rpc.com/',
  startBlock: 21986688,
  subgraph: {
    endpoint:
      'https://api.studio.thegraph.com/query/65299/unlock-protocol-polygon/version/latest',
    networkName: 'matic',
    studioName: 'unlock-protocol-polygon',
  },
  swapPurchaser: '0x33aC9CAE1Cd9CBB191116607f564F7381d81BAD9',
  tokens: [
    {
      address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
      decimals: 18,
      featured: true,
      name: 'Wrapped Ether',
      symbol: 'WETH',
    },
    {
      address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
      decimals: 18,
      featured: true,
      name: '(PoS) Dai Stablecoin',
      symbol: 'DAI',
    },
    {
      address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      decimals: 6,
      featured: true,
      name: '(PoS) Tether USD',
      symbol: 'USDT',
    },
    {
      address: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
      decimals: 6,
      featured: true,
      name: 'USD Coin',
      symbol: 'USDC',
    },
    {
      address: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',
      decimals: 8,
      featured: true,
      name: '(PoS) Wrapped BTC',
      symbol: 'WBTC',
    },
    {
      address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      decimals: 6,
      name: 'USD Coin (PoS)',
      symbol: 'USDC',
    },
    {
      address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
      decimals: 18,
      name: 'Wrapped Matic',
      symbol: 'WMATIC',
    },
    {
      address: '0xE06Bd4F5aAc8D0aA337D13eC88dB6defC6eAEefE',
      decimals: 18,
      name: 'PlanetIX',
      symbol: 'IXT',
    },
  ],
  uniswapV3: {
    factoryAddress: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
    oracle: '0xE77c7F14e8EB9925ca418bF80c0a81a5B9C87683',
    positionManager: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
    quoterAddress: '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6',
    universalRouterAddress: '0x4C60051384bd2d3C01bfc845Cf5F4b44bcbE9de5',
  },
  universalCard: {
    cardPurchaserAddress: '0xAB355a589CFbBA7a21b91E5B6063bF822dCc0016',
    stripeDestinationCurrency: 'usdc',
    stripeDestinationNetwork: 'polygon',
  },
  unlockAddress: '0xE8E5cd156f89F7bdB267EabD5C43Af3d5AF2A78f',
  unlockDaoToken: {
    address: '0xf7E78d9C4c74df889A83C8C8d6D05BF70fF75876',
    mainnetBridge: '0x40ec5B33f54e0E8A33A975908C5BA1c14e5BbbDf',
  },
  url: 'https://polygon.technology/',
}

export default polygon
