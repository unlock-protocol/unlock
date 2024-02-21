import { HookType, NetworkConfig } from '@unlock-protocol/types'

export const mumbai: NetworkConfig = {
  blockScan: {
    url: (address: string) => `https://blockscan.com/address/${address}`,
  },
  chain: 'mumbai',
  description: 'Polygon test network. Do not use for production.',
  explorer: {
    name: 'PolygonScan (Mumbai)',
    urls: {
      address: (address) => `https://mumbai.polygonscan.com/address/${address}`,
      base: `https://mumbai.polygonscan.com/`,
      token: (address, holder) =>
        `https://mumbai.polygonscan.com/token/${address}?a=${holder}`,
      transaction: (hash) => `https://mumbai.polygonscan.com/tx/${hash}`,
    },
  },
  faucet: 'https://faucet.polygon.technology/',
  featured: false,
  fullySubsidizedGas: true,
  governanceBridge: {
    connext: '0x2334937846Ab2A3FCE747b32587e1A1A2f6EEC5a',
    domainId: 9991,
  },
  hooks: {
    onKeyPurchaseHook: [
      {
        address: '0x34EbEc0AE80A2d078DE5489f0f5cAa4d3aaEA355',
        id: HookType.PASSWORD,
        name: 'Password required',
      },
      {
        address: '0xdd753E08BB09F22593537f29100F0eD98AfA57FA',
        id: HookType.CAPTCHA,
        name: 'Captcha',
      },
    ],
  },
  id: 80001,
  isTestNetwork: true,
  keyManagerAddress: '0x8c5D54B2CAA4C2D08B0DDF82a1e6D2641779B8EC',
  maxFreeClaimCost: 500,
  multisig: '0x12E37A8880801E1e5290c815a894d322ac591607',
  name: 'Mumbai (Polygon)',
  nativeCurrency: {
    coingecko: 'matic-network',
    decimals: 18,
    name: 'MATIC',
    symbol: 'MATIC',
    wrapped: '0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889',
  },
  opensea: {
    collectionUrl: (lockAddress) =>
      `https://testnets.opensea.io/assets/mumbai/${lockAddress}`,
    tokenUrl: (_lockAddress, _tokenId) =>
      `https://testnets.opensea.io/assets/mumbai/${_lockAddress}/${_tokenId}`,
  },
  previousDeploys: [],
  provider: 'https://rpc.unlock-protocol.com/80001',
  publicLockVersionToDeploy: 13,
  publicProvider: 'https://matic-mumbai.chainstacklabs.com',
  startBlock: 26584912,
  subgraph: {
    endpoint:
      'https://api.studio.thegraph.com/query/65299/unlock-protocol-mumbai/version/latest',
    studioName: 'unlock-protocol-mumbai',
  },
  swapPurchaser: '0x302E9D970A657B42c1C124C69f3a1c1575CB4AD3',
  tokens: [
    {
      address: '0x0FA8781a83E46826621b3BC094Ea2A0212e71B23',
      decimals: 6,
      featured: true,
      mainnetAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      name: 'USD Coin (PoS)',
      symbol: 'USDC',
    },
    {
      address: '0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa',
      decimals: 18,
      featured: true,
      mainnetAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      name: 'Wrapped Ether',
      symbol: 'WETH',
    },
    {
      address: '0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889',
      decimals: 18,
      featured: true,
      mainnetAddress: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0',
      name: 'Wrapped Matic',
      symbol: 'WMATIC',
    },
    {
      address: '0xcB1e72786A6eb3b44C2a2429e317c8a2462CFeb1',
      decimals: 18,
      featured: true,
      mainnetAddress: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      name: 'Dai Stablecoin',
      symbol: 'DAI',
    },
  ],
  uniswapV3: {
    factoryAddress: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
    oracle: '0x5108412Dd50A6ea79d2F13D5d1A23FDD9bF532db',
    quoterAddress: '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6',
    universalRouterAddress: '0x4648a43B2C14Da09FdF82B161150d3F634f40491',
  },
  unlockAddress: '0x1FF7e338d5E582138C46044dc238543Ce555C963',
  unlockOwner: '0xdc230F9A08918FaA5ae48B8E13647789A8B6dD46',
  url: 'https://mumbai.polygonscan.com/',
}

export default mumbai
