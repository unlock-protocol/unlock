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
      'https://api.thegraph.com/subgraphs/name/unlock-protocol/arbitrum',
    endpointV2:
      'https://api.thegraph.com/subgraphs/name/unlock-protocol/arbitrum-v2',
    networkName: 'arbitrum-one',
  },
  swapPurchaser: '0x0C33884Ab3eE799E7628FA3fCF20B81997745a72',
  tokens: [
    {
      address: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
      decimals: 18,
      name: 'Ethereum',
      symbol: 'WETH',
    },
    {
      address: '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8',
      decimals: 6,
      name: 'USD Coin',
      symbol: 'USDC',
    },
    {
      address: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
      decimals: 6,
      name: 'Tether',
      symbol: 'USDT',
    },
    {
      address: '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1',
      decimals: 18,
      name: 'Dai',
      symbol: 'DAI',
    },
    {
      address: '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f',
      decimals: 8,
      name: 'Wrapped Bitcoin',
      symbol: 'WBTC',
    },
  ],
  uniswapV3: {
    factoryAddress: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
    oracle: '0x821d830a7b9902F83359Bf3Ac727B04b10FD461d',
    quoterAddress: '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6',
    universalRouterAddress: '0x4C60051384bd2d3C01bfc845Cf5F4b44bcbE9de5',
  },
  unlockAddress: '0x1FF7e338d5E582138C46044dc238543Ce555C963',
  url: 'https://arbitrum.io/',
}

export default arbitrum
