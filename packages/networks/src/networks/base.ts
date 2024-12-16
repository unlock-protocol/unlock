import { NetworkConfig, HookType } from '@unlock-protocol/types'

export const base: NetworkConfig = {
  blockScan: {
    url: (address: string) => `https://blockscan.com/address/${address}`,
  },
  chain: 'base',
  dao: {
    chainId: 8453,
    governanceBridge: {
      connext: '0xB8448C6f7f7887D36DcA487370778e419e9ebE3F',
      domainId: 1650553709,
      modules: {
        connextMod: '0xfe9fD6af67E48D9f05Aa88679Ac294E3f28532eE',
        delayMod: '0x805C2EbaE1510f59E1D717A1A51aFad335FFAec5',
      },
    },
    governor: '0x65bA0624403Fc5Ca2b20479e9F626eD4D78E0aD9',
  },
  description:
    'Base is a secure, low-cost, builder-friendly Ethereum L2 built to bring the next billion users onchain.  ',
  explorer: {
    name: 'Basescan',
    urls: {
      address: (address: string) => `https://basescan.org/address/${address}`,
      base: `https://basescan.org/`,
      token: (address: string, holder: string) =>
        `https://basescan.org/token/${address}?a=${holder}`,
      transaction: (hash: string) => `https://basescan.org/tx/${hash}`,
    },
  },
  featured: true,
  fullySubsidizedGas: false,
  hooks: {
    onKeyPurchaseHook: [
      {
        address: '0x7455DdA870f8421b7C1920Efb84DFF7398c6A73E',
        id: HookType.PASSWORD,
        name: 'Password required',
      },
      {
        address: '0x8c573E1A64D7C6726B3b2E119206e9FD1f5Bc0a0',
        id: HookType.PROMOCODE,
        name: 'Discount code',
      },
      {
        address: '0xC2227b9fc792a5933E64FE9F782fdeDDaf49951b',
        id: HookType.PROMO_CODE_CAPPED,
        name: 'Discount code with caps',
      },
      {
        address: '0x87AaA7498Daf5Bb0DB03806fB5389b260E8aCe92',
        id: HookType.GUILD,
        name: 'Guild',
      },
      {
        address: '0x64441384DB40F34855b1617C05800bE43bD34709',
        id: HookType.PASSWORD_CAPPED,
        name: 'Passwords with caps. Multiple passwords can be used per contract',
      },
      {
        address: '0xbBBdD46ef548712c203d306F6587336EC15E0d7f',
        id: HookType.GITCOIN,
        name: 'Gitcoin',
      },
      {
        address: '0x3b36FfbfF6bC62D3E9f715bbDBabe477018b0c92',
        id: HookType.ALLOW_LIST,
        name: 'Allow List',
      },
    ],
    onTokenURIHook: [
      {
        address: '0x16de050b14B22DC070522b8De134490CB1655B11',
        id: HookType.ADVANCED_TOKEN_URI,
        name: 'Advanced Token URI',
      },
    ],
  },
  id: 8453,
  isTestNetwork: false,
  keyManagerAddress: '0xD26c05a33349a6DeD02DD9360e1ef303d1246fb6',
  kickbackAddress: '0xCf5802682F194C2447E92a63283471A99CB792f6',
  maxFreeClaimCost: 100,
  multisig: '0x8149FeaFa41DD1ee3CA62299b9c67e9ac12FA340',
  name: 'Base',
  nativeCurrency: {
    coingecko: 'ethereum',
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
    wrapped: '0x4200000000000000000000000000000000000006',
  },

  opensea: {
    collectionUrl: (lockAddress) =>
      `https://opensea.io/assets/base/${lockAddress}`,
    tokenUrl: (_lockAddress, _tokenId) =>
      `https://opensea.io/assets/base/${_lockAddress}/${_tokenId}`,
  },

  previousDeploys: [],

  provider: 'https://rpc.unlock-protocol.com/8453',

  publicLockVersionToDeploy: 14,

  publicProvider: 'https://mainnet.base.org',

  startBlock: 1750000,
  subgraph: {
    endpoint: 'https://subgraph.unlock-protocol.com/8453',
    graphId: 'ECQhJQV8KWMfAAgWf8WV5duy1si9TnZpL4f194oGLrWW',
    networkName: 'base',
    studioName: 'unlock-protocol-base',
  },
  tokens: [
    {
      address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      decimals: 6,
      featured: true,
      name: 'USD Coin',
      symbol: 'USDC',
    },
    {
      address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
      decimals: 18,
      featured: true,
      name: 'Dai Stablecoin',
      symbol: 'DAI',
    },
    {
      address: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA',
      decimals: 6,
      name: 'USD Base Coin',
      symbol: 'USDbC',
    },
    {
      address: '0x4200000000000000000000000000000000000006',
      decimals: 18,
      name: 'Wrapped Ether',
      symbol: 'WETH',
    },
    {
      address: '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed',
      decimals: 18,
      name: 'Degen',
      symbol: 'DEGEN',
    },
    {
      address: '0xaC27fa800955849d6D17cC8952Ba9dD6EAA66187',
      decimals: 18,
      name: 'UnlockProtocolToken',
      symbol: 'UP',
    },
    {
      address: '0xD7eA82D19f1f59FF1aE95F1945Ee6E6d86A25B96',
      decimals: 18,
      name: 'Unlock Discount Token',
      symbol: 'UDT',
    },
  ],
  uniswapV3: {
    factoryAddress: '0x33128a8fC17869897dcE68Ed026d694621f6FDfD',
    oracle: {
      100: '0x2411336105D4451713d23B5156038A48569EcE3a',
      3000: '0xfa7AC1c24339f629826C419eC95961Df58563438',
      500: '0xA8BB5AF09B599794136B14B112e137FAf83Acf1f',
    },
    positionManager: '0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1',
    universalRouterAddress: '0x198EF79F1F515F02dFE9e3115eD9fC07183f02fC',
  },
  unlockAddress: '0xd0b14797b9D08493392865647384974470202A78',
  unlockDaoToken: {
    address: '0xD7eA82D19f1f59FF1aE95F1945Ee6E6d86A25B96',
    mainnetBridge: '0x3154Cf16ccdb4C6d922629664174b904d80F2C35',
    uniswapV3Pool: '0x0a052dAd89F9695A0074958b81c85479bc8844F8',
  },
  url: 'https://base.org/',
}

export default base
