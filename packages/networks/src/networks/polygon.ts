import { HookType, NetworkConfig } from '@unlock-protocol/types'

export const polygon: NetworkConfig = {
  blockScan: {
    url: (address: string) => `https://blockscan.com/address/${address}`,
  },
  chain: 'polygon',
  dao: {
    chainId: 8453,
    governanceBridge: {
      connext: '0x11984dc4465481512eb5b777E44061C158CF2259',
      domainId: 1886350457,
      modules: {
        connextMod: '0xa8E0FD3D023B1A253eF52B6169851Ee95eF257bE',
        delayMod: '0x31B8bB0BC5ffEe8e476202e9D97b0b8c31aA767d',
      },
    },
    governor: '0x65bA0624403Fc5Ca2b20479e9F626eD4D78E0aD9',
  },
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
        address: '0x25Ec032F38b87295bA43C825993B9F4E1F4065c9',
        id: HookType.PROMO_CODE_CAPPED,
        name: 'Discount code with caps',
      },
      {
        address: '0xc2D767a87d74d82CD4B290a63E2D703Ff1CDf6b9',
        id: HookType.PASSWORD_CAPPED,
        name: 'Passwords with caps. Multiple passwords can be used per contract',
      },
    ],
  },
  id: 137,
  isTestNetwork: false,
  keyManagerAddress: '0x7111a1aDfbED501beaAd556Bba7cB6dCa3296aa9',
  kickbackAddress: '0x247a38358c4d99A29091C1cEadfb8a54B783D438',
  maxFreeClaimCost: 100,
  multisig: '0x479f3830fbd715342868BA95E438609BCe443DFB',
  name: 'Polygon',
  nativeCurrency: {
    coingecko: 'matic-network',
    decimals: 18,
    name: 'Wrapped Polygon Ecosystem Token',
    symbol: 'WPOL',
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
  publicLockVersionToDeploy: 14,
  publicProvider: 'https://polygon-rpc.com/',
  startBlock: 21986688,
  subgraph: {
    endpoint: 'https://subgraph.unlock-protocol.com/137',
    graphId: '6UrwdJt18yfk4PGzxyeYdH9hUM8PzWvuLbUTKa3T17PD',
    networkName: 'matic',
    studioName: 'unlock-protocol-polygon',
  },
  tokens: [
    {
      address: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
      decimals: 6,
      featured: true,
      name: 'USD Coin',
      symbol: 'USDC',
    },
    {
      address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      decimals: 6,
      name: 'USD Coin (PoS)',
      symbol: 'USDC',
    },
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
      address: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',
      decimals: 8,
      featured: true,
      name: '(PoS) Wrapped BTC',
      symbol: 'WBTC',
    },
    {
      address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
      decimals: 18,
      name: 'Wrapped Polygon Ecosystem Token',
      symbol: 'WPOL',
    },
    {
      address: '0xE06Bd4F5aAc8D0aA337D13eC88dB6defC6eAEefE',
      decimals: 18,
      name: 'PlanetIX',
      symbol: 'IXT',
    },
    {
      address: '0xf7E78d9C4c74df889A83C8C8d6D05BF70fF75876',
      decimals: 18,
      name: 'Unlock Discount Token (PoS)',
      symbol: 'UDT',
    },
  ],
  uniswapV3: {
    factoryAddress: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
    oracle: {
      100: '0x8c0AC149FabEeC9b759a43fC7d301B1a1D8DE0d0',
      3000: '0x86399725a83bB14C47bB5ce8311Ed25378BAa162',
      500: '0xfA3F427d2691ce680f96E6916a9Dac6c9042CBd2',
    },
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
    uniswapV3Pool: '0x8B2b66ec1E6C1895eb408F8b8fcd8cD9510F9115',
  },
  url: 'https://polygon.technology/',
}

export default polygon
