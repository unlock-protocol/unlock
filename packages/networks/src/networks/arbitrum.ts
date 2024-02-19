import { HookType, NetworkConfig } from '@unlock-protocol/types'

export const arbitrum: NetworkConfig = {
  blockScan: {
    url: (address: string) => `https://blockscan.com/address/${address}`,
  },
  chain: 'arbitrum',
  description:
    'Arbitrum One is a Layer 2 (L2) chain running on top of Ethereum Mainnet that enables high-throughput, low cost smart contracts operations.',
  explorer: {
    name: 'Arbitrum',
    urls: {
      address: (address) => `https://arbiscan.io/address/${address}`,
      base: `https://arbiscan.io/`,
      token: (address, holder) =>
        `https://arbiscan.io/token/${address}?a=${holder}`,
      transaction: (hash) => `https://arbiscan.io/tx/${hash}`,
    },
  },
  featured: true,
  governanceBridge: {
    connext: '0xEE9deC2712cCE65174B561151701Bf54b99C24C8',
    domainId: 1634886255,
    modules: {
      connextMod: '0x4A553635774b3d6fB6273A83b5B49577dF450227',
      delayMod: '0xF241F12506fb6Bf1909c6bC176A199166414007a',
    },
  },
  hooks: {
    onKeyPurchaseHook: [
      {
        address: '0xd0b14797b9D08493392865647384974470202A78',
        id: HookType.PASSWORD,
        name: 'Password required',
      },
      {
        address: '0xD925Ac2887Ba4372849F0fd64217A6749552bb21',
        id: HookType.CAPTCHA,
        name: 'Captcha',
      },
      {
        address: '0x06538095ae3B5123e440D9991377B85C3BC6E6FF',
        id: HookType.GUILD,
        name: 'Guild',
      },
      {
        address: '0x1A9E2E085bF4E4fE5eE45C682a3Af26d55FA1431',
        id: HookType.PROMO_CODE_CAPPED,
        name: 'Discount code with caps',
      },
    ],
  },
  id: 42161,
  isTestNetwork: false,
  keyManagerAddress: '0x520294E736167303efa038205D4391b58261BC9c',
  maxFreeClaimCost: 100,
  multisig: '0x310e9f9E3918a71dB8230cFCF32a083c7D9536d0',
  name: 'Arbitrum',
  nativeCurrency: {
    coingecko: 'ethereum',
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
    wrapped: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
  },
  opensea: {
    collectionUrl: (lockAddress) =>
      `https://opensea.io/assets/arbitrum/${lockAddress}`,
    tokenUrl: (_lockAddress, _tokenId) =>
      `https://opensea.io/assets/arbitrum/${_lockAddress}/${_tokenId}`,
  },
  previousDeploys: [],
  provider: 'https://rpc.unlock-protocol.com/42161',
  publicLockVersionToDeploy: 13,
  publicProvider: 'https://arb1.arbitrum.io/rpc',
  startBlock: 17429533,
  subgraph: {
    endpoint:
      'https://api.studio.thegraph.com/query/65299/unlock-protocol-arbitrum/version/latest',
    networkName: 'arbitrum-one',
    studioName: 'unlock-protocol-arbitrum',
  },
  swapPurchaser: '0x0C33884Ab3eE799E7628FA3fCF20B81997745a72',
  tokens: [
    {
      address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
      decimals: 18,
      featured: true,
      name: 'Wrapped Ether',
      symbol: 'WETH',
    },
    {
      address: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
      decimals: 6,
      name: 'USD Coin (Arb1)',
      symbol: 'USDC',
    },
    {
      address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
      decimals: 6,
      featured: true,
      name: 'USD Coin',
      symbol: 'USDC',
    },
    {
      address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
      decimals: 6,
      featured: true,
      name: 'Tether USD',
      symbol: 'USDT',
    },
    {
      address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
      decimals: 18,
      featured: true,
      name: 'Dai Stablecoin',
      symbol: 'DAI',
    },
    {
      address: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
      decimals: 8,
      featured: true,
      name: 'Wrapped BTC',
      symbol: 'WBTC',
    },
    {
      address: '0x912CE59144191C1204E64559FE8253a0e49E6548',
      decimals: 18,
      name: 'Arbitrum',
      symbol: 'ARB',
    },
  ],
  uniswapV3: {
    factoryAddress: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
    oracle: '0x821d830a7b9902F83359Bf3Ac727B04b10FD461d',
    positionManager: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
    quoterAddress: '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6',
    universalRouterAddress: '0x4C60051384bd2d3C01bfc845Cf5F4b44bcbE9de5',
  },
  unlockAddress: '0x1FF7e338d5E582138C46044dc238543Ce555C963',
  url: 'https://arbitrum.io/',
}

export default arbitrum
