import { HookType, NetworkConfig } from '@unlock-protocol/types'

export const mainnet: NetworkConfig = {
  blockScan: {
    url: (address: string) => `https://blockscan.com/address/${address}`,
  },
  chain: 'ethereum',
  description:
    'The original and most secure EVM network. Gas fees are expensive on this network.',
  explorer: {
    name: 'Etherscan',
    urls: {
      address: (address) => `https://etherscan.io/address/${address}`,
      base: 'https://etherscan.io/',
      token: (address, holder) =>
        `https://etherscan.com/token/${address}?a=${holder}`,
      transaction: (hash) => `https://etherscan.io/tx/${hash}`,
    },
  },
  featured: true,
  governanceBridge: {
    connext: '0x8898B472C54c31894e3B9bb83cEA802a5d0e63C6',
    domainId: 6648936,
  },
  hooks: {
    onKeyPurchaseHook: [
      {
        address: '0x936Ed3E71b5990bC9A94074835D08C6ca7bbFad0',
        id: HookType.PASSWORD,
        name: 'Password required',
      },
      {
        address: '0xaF96721f8ffc136e4C170446E68Dc6744B6Ee4f4',
        id: HookType.CAPTCHA,
        name: 'Captcha',
      },
      {
        address: '0x1d8DD27432cC0aCB93B93c4486F46b67E2208359',
        id: HookType.GUILD,
        name: 'Guild',
      },
    ],
  },
  id: 1,
  isTestNetwork: false,
  keyManagerAddress: '0x9A1f43090307034DBFBE2ba20320Ce815ff046D4',
  maxFreeClaimCost: 1,
  multisig: '0x9168EABE624e9515f3836bA1716EC1DDd4C461D4',
  name: 'Ethereum',
  nativeCurrency: {
    coingecko: 'ethereum',
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
    wrapped: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  },
  opensea: {
    collectionUrl: (lockAddress) => `https://opensea.io/assets/${lockAddress}`,
    profileUrl: (address) => `https://opensea.io/${address}`,
    tokenUrl: (lockAddress, tokenId) =>
      `https://opensea.io/assets/${lockAddress}/${tokenId}`,
  },
  previousDeploys: [
    {
      startBlock: 7120795,
      unlockAddress: '0x3d5409CcE1d45233dE1D4eBDEe74b8E004abDD13',
    },
  ],
  provider: 'https://rpc.unlock-protocol.com/1',
  publicLockVersionToDeploy: 13,
  publicProvider: 'https://cloudflare-eth.com/v1/mainnet',
  startBlock: 16989000,
  subgraph: {
    endpoint: 'https://api.thegraph.com/subgraphs/name/unlock-protocol/unlock',
    endpointV2:
      'https://api.thegraph.com/subgraphs/name/unlock-protocol/mainnet-v2',
    studioEndpoint: 'unlock-protocol-mainnet',
  },
  swapPurchaser: '0x02415541c7F4c976722493181cFdb0b46E1c94fb',
  tokens: [
    {
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      decimals: 18,
      name: 'Wrapped Ether',
      symbol: 'WETH',
    },
    {
      address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      decimals: 18,
      name: 'Dai Stablecoin',
      symbol: 'DAI',
    },
    {
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      decimals: 6,
      name: 'USD Coin',
      symbol: 'USDC',
    },
    {
      address: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0',
      decimals: 18,
      name: 'Polygon',
      symbol: 'MATIC',
    },
    {
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      decimals: 6,
      name: 'Tether USD',
      symbol: 'USDT',
    },
    {
      address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
      decimals: 8,
      name: 'Wrapped BTC',
      symbol: 'WBTC',
    },
    {
      address: '0x0D8775F648430679A709E98d2b0Cb6250d2887EF',
      decimals: 18,
      name: 'Basic Attention Token',
      symbol: 'BAT',
    },
  ],
  uniswapV3: {
    factoryAddress: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
    oracle: '0x951A807b523cF6e178e0ab80fBd2C9B035521931',
    quoterAddress: '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6',
    subgraph: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3',
    universalRouterAddress: '0xEf1c6E67703c7BD7107eed8303Fbe6EC2554BF6B',
  },
  unlockAddress: '0xe79B93f8E22676774F2A8dAd469175ebd00029FA',
  url: 'https://ethereum.org/en/',
  // universalCard: {
  //   cardPurchaserAddress: '0x49814dd8a03594bE78a18455CC4Df3876ecFbD69',
  //   stripeDestinationNetwork: 'ethereum',
  //   stripeDestinationCurrency: 'usdc',
  // },
}

export default mainnet
