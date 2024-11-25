import { HookType, NetworkConfig } from '@unlock-protocol/types'

export const mainnet: NetworkConfig = {
  blockScan: {
    url: (address: string) => `https://blockscan.com/address/${address}`,
  },
  chain: 'ethereum',
  dao: {
    chainId: 8453,
    governanceBridge: {
      connext: '0x8898B472C54c31894e3B9bb83cEA802a5d0e63C6',
      domainId: 6648936,
      modules: {
        connextMod: '0xAB6A5080e569A269D8cB54fdD00312A2c4c3a3aa',
        delayMod: '0x8f05058d05C8167132f07aAA5130Ed3F0D78d5aE',
      },
    },
    governor: '0x65bA0624403Fc5Ca2b20479e9F626eD4D78E0aD9',
  },
  description: 'The original and most secure EVM network. ',
  explorer: {
    name: 'Etherscan',
    urls: {
      address: (address) => `https://etherscan.io/address/${address}`,
      base: 'https://etherscan.io/',
      token: (address, holder) =>
        `https://etherscan.io/token/${address}?a=${holder}`,
      transaction: (hash) => `https://etherscan.io/tx/${hash}`,
    },
  },
  featured: true,
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
      {
        address: '0xfF7aBFACC805AD158a8ea554d4c363FC2D9527d4',
        id: HookType.ALLOW_LIST,
        name: 'Allow List',
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
  publicLockVersionToDeploy: 14,
  publicProvider: 'https://cloudflare-eth.com/v1/mainnet',
  startBlock: 16989000,
  subgraph: {
    endpoint: 'https://subgraph.unlock-protocol.com/1',
    graphId: 'CTj3qyHTnQuTD16RkmV1BK6UmYPADwUD7WNNLEvQuTv9',
    studioName: 'unlock-protocol-mainnet',
  },
  tokens: [
    {
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      decimals: 6,
      featured: true,
      name: 'USD Coin',
      symbol: 'USDC',
    },
    {
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      decimals: 18,
      featured: true,
      name: 'Wrapped Ether',
      symbol: 'WETH',
    },
    {
      address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      decimals: 18,
      featured: true,
      name: 'Dai Stablecoin',
      symbol: 'DAI',
    },
    {
      address: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0',
      decimals: 18,
      name: 'Matic Token',
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
      featured: true,
      name: 'Wrapped BTC',
      symbol: 'WBTC',
    },
    {
      address: '0x0D8775F648430679A709E98d2b0Cb6250d2887EF',
      decimals: 18,
      name: 'Basic Attention Token',
      symbol: 'BAT',
    },
    {
      address: '0xd7C1EB0fe4A30d3B2a846C04aa6300888f087A5F',
      decimals: 18,
      name: 'POINTS',
      symbol: 'POINTS',
    },
    {
      address: '0x58b6A8A3302369DAEc383334672404Ee733aB239',
      decimals: 18,
      name: 'Livepeer Token',
      symbol: 'LPT',
    },
    {
      address: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE',
      decimals: 18,
      name: 'SHIBA INU',
      symbol: 'SHIB',
    },
    {
      address: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
      decimals: 18,
      name: 'ChainLink Token',
      symbol: 'LINK',
    },
    {
      address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
      decimals: 18,
      name: 'Uniswap',
      symbol: 'UNI',
    },
    {
      address: '0xB8c77482e45F1F44dE1745F52C74426C631bDD52',
      decimals: 18,
      name: 'BNB',
      symbol: 'BNB',
    },
    {
      address: '0x90DE74265a416e1393A450752175AED98fe11517',
      decimals: 18,
      name: 'Unlock Discount Token',
      symbol: 'UDT',
    },
  ],
  uniswapV3: {
    factoryAddress: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
    oracle: {
      100: '0x92C9b3A4FFD7D2046132732FedC9f9f25E316F0B',
      3000: '0x584c5af22DB79a13F4Fb45c66E0ff2311D58d9B2',
      500: '0x2e5F6B31d100C527B782e26953D9509C591aC41d',
    },
    positionManager: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
    quoterAddress: '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6',
    subgraph: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3',
    universalRouterAddress: '0xEf1c6E67703c7BD7107eed8303Fbe6EC2554BF6B',
  },
  unlockAddress: '0xe79B93f8E22676774F2A8dAd469175ebd00029FA',
  unlockDaoToken: {
    address: '0x90DE74265a416e1393A450752175AED98fe11517',
  },
  url: 'https://ethereum.org/en/',
  // universalCard: {
  //   cardPurchaserAddress: '0x49814dd8a03594bE78a18455CC4Df3876ecFbD69',
  //   stripeDestinationNetwork: 'ethereum',
  //   stripeDestinationCurrency: 'usdc',
  // },
}

export default mainnet
