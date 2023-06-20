import { HookType, NetworkConfig } from '@unlock-protocol/types'

export const arbitrum: NetworkConfig = {
  publicLockVersionToDeploy: 13,
  featured: true,
  publicProvider: 'https://arb1.arbitrum.io/rpc',
  provider: 'https://rpc.unlock-protocol.com/42161',
  unlockAddress: '0x1FF7e338d5E582138C46044dc238543Ce555C963',
  multisig: '0x310e9f9E3918a71dB8230cFCF32a083c7D9536d0',
  keyManagerAddress: '0x520294E736167303efa038205D4391b58261BC9c',
  id: 42161,
  name: 'Arbitrum',
  chain: 'arbitrum',
  subgraph: {
    endpoint:
      'https://api.thegraph.com/subgraphs/name/unlock-protocol/arbitrum',
    networkName: 'arbitrum-one',
    endpointV2:
      'https://api.thegraph.com/subgraphs/name/unlock-protocol/arbitrum-v2',
  },
  explorer: {
    name: 'Arbitrum',
    urls: {
      base: `https://arbiscan.io/`,
      address: (address) => `https://arbiscan.io/address/${address}`,
      transaction: (hash) => `https://arbiscan.io/tx/${hash}`,
      token: (address, holder) =>
        `https://arbiscan.io/token/${address}?a=${holder}`,
    },
  },
  opensea: {
    tokenUrl: (_lockAddress, _tokenId) =>
      `https://opensea.io/assets/arbitrum/${_lockAddress}/${_tokenId}`,
    collectionUrl: (lockAddress) =>
      `https://opensea.io/assets/arbitrum/${lockAddress}`,
  },
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
    coingecko: 'ethereum',
  },
  startBlock: 17429533,
  previousDeploys: [],
  isTestNetwork: false,
  maxFreeClaimCost: 100,
  description:
    'Arbitrum One is a Layer 2 (L2) chain running on top of Ethereum Mainnet that enables high-throughput, low cost smart contracts operations.',
  url: 'https://arbitrum.io/',
  uniswapV3: {
    factoryAddress: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
    quoterAddress: '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6',
    oracle: '0x821d830a7b9902F83359Bf3Ac727B04b10FD461d',
    universalRouterAddress: '0x4C60051384bd2d3C01bfc845Cf5F4b44bcbE9de5',
  },
  swapPurchaser: '0x0C33884Ab3eE799E7628FA3fCF20B81997745a72',
  wrappedNativeCurrency: {
    name: 'Wrapped Ether',
    symbol: 'WETH',
    decimals: 18,
    address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
  },
  tokens: [
    {
      name: 'Ethereum',
      symbol: 'WETH',
      decimals: 18,
      address: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
    },
    {
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6,
      address: '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8',
    },
    {
      name: 'Tether',
      symbol: 'USDT',
      decimals: 6,
      address: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
    },
    {
      name: 'Dai',
      symbol: 'DAI',
      decimals: 18,
      address: '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1',
    },
    {
      name: 'Wrapped Bitcoin',
      symbol: 'WBTC',
      decimals: 8,
      address: '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f',
    },
  ],
  hooks: {
    onKeyPurchaseHook: [
      {
        id: HookType.PASSWORD,
        name: 'Password required',
        address: '0xd0b14797b9D08493392865647384974470202A78',
      },
      {
        id: HookType.CAPTCHA,
        name: 'Captcha',
        address: '0xD925Ac2887Ba4372849F0fd64217A6749552bb21',
      },
      {
        id: HookType.GUILD,
        name: 'Guild',
        address: '0x06538095ae3B5123e440D9991377B85C3BC6E6FF',
      },
    ],
  },
}

export default arbitrum
