import { HookType, NetworkConfig } from '@unlock-protocol/types'

export const mainnet: NetworkConfig = {
  publicLockVersionToDeploy: 13,
  featured: true,
  id: 1,
  publicProvider: 'https://cloudflare-eth.com/v1/mainnet',
  provider: 'https://rpc.unlock-protocol.com/1',
  unlockAddress: '0xe79B93f8E22676774F2A8dAd469175ebd00029FA',
  previousDeploys: [
    {
      unlockAddress: '0x3d5409CcE1d45233dE1D4eBDEe74b8E004abDD13',
      startBlock: 7120795,
    },
  ],
  multisig: '0x9168EABE624e9515f3836bA1716EC1DDd4C461D4',
  keyManagerAddress: '0x9A1f43090307034DBFBE2ba20320Ce815ff046D4',
  name: 'Ethereum',
  chain: 'ethereum',
  subgraph: {
    endpoint: 'https://api.thegraph.com/subgraphs/name/unlock-protocol/unlock',
    endpointV2:
      'https://api.thegraph.com/subgraphs/name/unlock-protocol/mainnet-v2',
  },
  explorer: {
    name: 'Etherscan',
    urls: {
      base: 'https://etherscan.io/',
      address: (address) => `https://etherscan.io/address/${address}`,
      transaction: (hash) => `https://etherscan.io/tx/${hash}`,
      token: (address, holder) =>
        `https://etherscan.com/token/${address}?a=${holder}`,
    },
  },
  opensea: {
    tokenUrl: (lockAddress, tokenId) =>
      `https://opensea.io/assets/${lockAddress}/${tokenId}`,
    collectionUrl: (lockAddress) => `https://opensea.io/assets/${lockAddress}`,
    profileUrl: (address) => `https://opensea.io/${address}`,
  },
  blockScan: {
    url: (address: string) => `https://blockscan.com/address/${address}`,
  },
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
    coingecko: 'ethereum',
  },
  startBlock: 16989000,
  description:
    'The original and most secure EVM network. Gas fees are expensive on this network.',
  url: 'https://ethereum.org/en/',
  isTestNetwork: false,
  maxFreeClaimCost: 1,
  uniswapV2: {
    oracle: '0xE118d797E1c44F2e2A2823191a51D8b46a4A1D51',
  },
  uniswapV3: {
    subgraph: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3',
    factoryAddress: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
    quoterAddress: '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6',
    oracle: '0x951A807b523cF6e178e0ab80fBd2C9B035521931',
    universalRouterAddress: '0xEf1c6E67703c7BD7107eed8303Fbe6EC2554BF6B',
  },
  swapPurchaser: '0x7039d2BB4CfC5f5DA49E6b4b9c40400bccb0d1E8',
  wrappedNativeCurrency: {
    name: 'Wrapped Ether',
    symbol: 'WETH',
    decimals: 18,
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  },
  tokens: [
    {
      name: 'Wrapped Ether',
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      symbol: 'WETH',
      decimals: 18,
    },
    {
      name: 'Dai Stablecoin',
      address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      symbol: 'DAI',
      decimals: 18,
    },
    {
      name: 'USD Coin',
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      symbol: 'USDC',
      decimals: 6,
    },
    {
      address: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0',
      name: 'Polygon',
      symbol: 'MATIC',
      decimals: 18,
    },
    {
      name: 'Tether USD',
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      symbol: 'USDT',
      decimals: 6,
    },
    {
      name: 'Wrapped BTC',
      address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
      symbol: 'WBTC',
      decimals: 8,
    },
    {
      address: '0x0D8775F648430679A709E98d2b0Cb6250d2887EF',
      name: 'Basic Attention Token',
      symbol: 'BAT',
      decimals: 18,
    },
  ],
  hooks: {
    onKeyPurchaseHook: [
      {
        id: HookType.PASSWORD,
        name: 'Password required',
        address: '0x936Ed3E71b5990bC9A94074835D08C6ca7bbFad0',
      },
      {
        id: HookType.CAPTCHA,
        name: 'Captcha',
        address: '0x0959482CbFB3c3C85ECd7bf690a0cde808eE8471',
      },
    ],
  },
  universalCard: {
    cardPurchaserAddress: '0x49814dd8a03594bE78a18455CC4Df3876ecFbD69',
    stripeDestinationNetwork: 'ethereum',
    stripeDestinationCurrency: 'usdc',
  },
}

export default mainnet
