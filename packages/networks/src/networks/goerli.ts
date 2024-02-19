import { HookType, NetworkConfig } from '@unlock-protocol/types'

export const goerli: NetworkConfig = {
  blockScan: {
    url: (address: string) => `https://blockscan.com/address/${address}`,
  },
  chain: 'goerli',
  description: 'Main Ethereum test network. Do not use for production.',
  explorer: {
    name: 'Goerli',
    urls: {
      address: (address) => `https://goerli.etherscan.io/address/${address}`,
      base: `https://goerli.etherscan.io/`,
      token: (address, holder) =>
        `https://goerli.etherscan.io/token/${address}?a=${holder}`,
      transaction: (hash) => `https://goerli.etherscan.io/tx/${hash}`,
    },
  },
  faucet: 'https://goerlifaucet.com/',
  featured: true,
  fullySubsidizedGas: true,
  governanceBridge: {
    connext: '0xFCa08024A6D4bCc87275b1E4A1E22B71fAD7f649',
    domainId: 1735353714,
    modules: {
      connextMod: '0xce58DB94DE48A8a9Ea47cBe4376F19724D154DF2',
      delayMod: '0x46FdC1d73486E20406D1C6dAcDD22b6599AEA32d',
    },
  },
  hooks: {
    onKeyPurchaseHook: [
      {
        address: '0xCa837900f7DaB40787b608b6738d1B730f1d2759',
        id: HookType.PASSWORD,
        name: 'Password required',
      },
      {
        address: '0xDF2A7C8be199C0e9e825750586be7F331F30dC29',
        id: HookType.CAPTCHA,
        name: 'Captcha',
      },
      {
        address: '0x1AC9271D271b8E50537CAd54b330424C52A84822',
        id: HookType.GUILD,
        name: 'Guild',
      },
      {
        address: '0x850c015A6A88756a59Dc025fca988494fF90DBB7',
        id: HookType.PROMOCODE,
        name: 'Discount code',
      },
      {
        address: '0x6d1571813c8fEB24856594d23b323234B1adEfE1',
        id: HookType.PROMO_CODE_CAPPED,
        name: 'Discount code with caps',
      },
    ],
  },
  id: 5,
  isTestNetwork: true,
  keyManagerAddress: '0xc328aE7fc36f975BE120aaa99f2d96C3E732e5b6',
  maxFreeClaimCost: 100000,
  multisig: '0x95C06469e557d8645966077891B4aeDe8D55A755',
  name: 'Goerli',
  nativeCurrency: {
    coingecko: 'ethereum',
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
    wrapped: '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6',
  },
  opensea: {
    collectionUrl: (lockAddress) =>
      `https://testnets.opensea.io/assets/goerli/${lockAddress}`,
    tokenUrl: (lockAddress, tokenId) =>
      `https://testnets.opensea.io/assets/goerli/${lockAddress}/${tokenId}`,
  },
  previousDeploys: [],
  provider: 'https://rpc.unlock-protocol.com/5',
  publicLockVersionToDeploy: 13,
  publicProvider:
    'https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
  startBlock: 7179039,
  subgraph: {
    endpoint:
      'https://api.studio.thegraph.com/query/65299/unlock-protocol-goerli/version/latest',
    studioName: 'unlock-protocol-goerli',
  },
  swapPurchaser: '0x49aD0039B30De002d4C27A6E8Fc026c7e23d083C',
  tokens: [
    {
      address: '0x07865c6E87B9F70255377e024ace6630C1Eaa37F',
      decimals: 6,
      featured: true,
      mainnetAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      name: 'USD Coin',
      symbol: 'USDC',
    },
    {
      address: '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6',
      decimals: 18,
      featured: true,
      mainnetAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      name: 'Wrapped Ether',
      symbol: 'WETH',
    },
    {
      address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
      decimals: 18,
      featured: true,
      mainnetAddress: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
      name: 'Uniswap',
      symbol: 'UNI',
    },
  ],
  uniswapV3: {
    factoryAddress: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
    oracle: '0x25197CaCDE16500032EF4B35d60c6f7aEd4a38a5',
    positionManager: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
    universalRouterAddress: '0x4648a43B2C14Da09FdF82B161150d3F634f40491',
  },
  universalCard: {
    cardPurchaserAddress: '0x061Bfda0446c5f71Da760BC31371CB95808f5d82',
    stripeDestinationCurrency: 'usdc',
    stripeDestinationNetwork: 'ethereum',
  },
  unlockAddress: '0x627118a4fB747016911e5cDA82e2E77C531e8206',
  unlockOwner: '0x6E74DC46EbF2cDB75B72Ab1dCAe3C98c7E9d28a1',
  url: 'https://goerli.net/',
}

export default goerli
