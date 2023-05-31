import { HookType, NetworkConfig } from '@unlock-protocol/types'

export const mumbai: NetworkConfig = {
  publicLockVersionToDeploy: 13,
  publicProvider: 'https://matic-mumbai.chainstacklabs.com',
  provider: 'https://rpc.unlock-protocol.com/80001',
  unlockAddress: '0x1FF7e338d5E582138C46044dc238543Ce555C963',
  multisig: '0x12E37A8880801E1e5290c815a894d322ac591607',
  keyManagerAddress: '0x8c5D54B2CAA4C2D08B0DDF82a1e6D2641779B8EC',
  id: 80001,
  name: 'Mumbai (Polygon)',
  chain: 'mumbai',
  subgraph: {
    endpoint: 'https://api.thegraph.com/subgraphs/name/unlock-protocol/mumbai',
    endpointV2:
      'https://api.thegraph.com/subgraphs/name/unlock-protocol/mumbai-v2',
  },
  explorer: {
    name: 'PolygonScan (Mumbai)',
    urls: {
      base: `https://mumbai.polygonscan.com/`,
      address: (address) => `https://mumbai.polygonscan.com/address/${address}`,
      transaction: (hash) => `https://mumbai.polygonscan.com/tx/${hash}`,
      token: (address, holder) =>
        `https://mumbai.polygonscan.com/token/${address}?a=${holder}`,
    },
  },
  opensea: {
    tokenUrl: (_lockAddress, _tokenId) => null,
  },
  nativeCurrency: {
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18,
    coingecko: 'matic-network',
  },
  startBlock: 26584912,
  previousDeploys: [],
  description: 'Polygon test network. Do not use for production.',
  url: 'https://mumbai.polygonscan.com/',
  faucet: 'https://faucet.polygon.technology/',
  isTestNetwork: true,
  fullySubsidizedGas: true,
  maxFreeClaimCost: 500,
  uniswapV3: {
    factoryAddress: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
    quoterAddress: '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6',
    oracle: '0x5108412Dd50A6ea79d2F13D5d1A23FDD9bF532db',
    universalRouterAddress: '0x4648a43B2C14Da09FdF82B161150d3F634f40491',
  },
  swapPurchaser: '0x302E9D970A657B42c1C124C69f3a1c1575CB4AD3',
  unlockOwner: '0x5814B64C69ae89f152859d20f53B240df1AC5066',
  wrappedNativeCurrency: {
    name: 'Wrapped MATIC',
    symbol: 'WMATIC',
    decimals: 18,
    address: '0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889',
  },
  tokens: [
    {
      name: 'USD Coin',
      address: '0x0FA8781a83E46826621b3BC094Ea2A0212e71B23',
      symbol: 'USDC',
      decimals: 6,
      mainnetAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    },
    {
      name: 'Wrapped Ether',
      address: '0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa',
      symbol: 'WETH',
      decimals: 18,
      mainnetAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    },
    {
      name: 'Wrapped Matic',
      address: '0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889',
      symbol: 'WMATIC',
      decimals: 18,
      mainnetAddress: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0',
    },
    {
      name: 'Dai Stablecoin',
      address: '0xcB1e72786A6eb3b44C2a2429e317c8a2462CFeb1',
      symbol: 'DAI',
      decimals: 18,
      mainnetAddress: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    },
  ],
  bridge: {
    domainId: 9991,
    connext: '0x2334937846Ab2A3FCE747b32587e1A1A2f6EEC5a',
  },
  hooks: {
    onKeyPurchaseHook: [
      {
        id: HookType.PASSWORD,
        name: 'Password required',
        address: '0x34EbEc0AE80A2d078DE5489f0f5cAa4d3aaEA355',
      },
      {
        id: HookType.CAPTCHA,
        name: 'Captcha',
        address: '0x639143cbf90F27eA5Ce4b3A7D869d4D7878009A5',
      },
    ],
  },
}

export default mumbai
