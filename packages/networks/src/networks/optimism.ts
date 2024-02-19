import { HookType, NetworkConfig } from '@unlock-protocol/types'

export const optimism: NetworkConfig = {
  blockScan: {
    url: (address: string) => `https://blockscan.com/address/${address}`,
  },
  chain: 'optimism',
  description:
    'Optimism is a Layer 2 Optimistic Rollup network designed to utilize the strong security guarantees of Ethereum while reducing its cost and latency.',
  explorer: {
    name: 'Etherscan',
    urls: {
      address: (address) =>
        `https://optimistic.etherscan.io/address/${address}`,
      base: `https://optimistic.etherscan.io/`,
      token: (address, holder) =>
        `https://optimistic.etherscan.io/token/${address}?a=${holder}`,
      transaction: (hash) => `https://optimistic.etherscan.io/tx/${hash}`,
    },
  },
  featured: true,
  governanceBridge: {
    connext: '0x8f7492DE823025b4CfaAB1D34c58963F2af5DEDA',
    domainId: 1869640809,
    modules: {
      connextMod: '0xF241F12506fb6Bf1909c6bC176A199166414007a',
      delayMod: '0xA8BB5AF09B599794136B14B112e137FAf83Acf1f',
    },
  },
  hooks: {
    onKeyPurchaseHook: [
      {
        address: '0x34EbEc0AE80A2d078DE5489f0f5cAa4d3aaEA355',
        id: HookType.PASSWORD,
        name: 'Password required',
      },
      {
        address: '0xF6a9138b4ebEd2AcF651Cbd40B45584B4c625e87',
        id: HookType.CAPTCHA,
        name: 'Captcha',
      },
      {
        address: '0x1402D55BF0D6566ca8F569041000a8015b608632',
        id: HookType.GUILD,
        name: 'Guild',
      },
      {
        address: '0x8e0B46ec3B95c81355175693dA0083b00fCc1326',
        id: HookType.PROMOCODE,
        name: 'Discount code',
      },
      {
        address: '0xD4385fd4A79B6636828eC8BC6795766a797E9CF5',
        id: HookType.PROMO_CODE_CAPPED,
        name: 'Discount code with caps',
      },
    ],
  },
  id: 10,
  isTestNetwork: false,
  keyManagerAddress: '0x8c5D54B2CAA4C2D08B0DDF82a1e6D2641779B8EC',
  maxFreeClaimCost: 100,
  multisig: '0x6E78b4447e34e751EC181DCBed63633aA753e145',
  name: 'Optimism',
  nativeCurrency: {
    coingecko: 'ethereum',
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
    wrapped: '0x4200000000000000000000000000000000000006',
  },
  opensea: {
    collectionUrl: (lockAddress) =>
      `https://opensea.io/assets/optimism/${lockAddress}`,
    tokenUrl: (_lockAddress, _tokenId) =>
      `https://opensea.io/assets/optimism/${_lockAddress}/${_tokenId}`,
  },
  previousDeploys: [],
  provider: 'https://rpc.unlock-protocol.com/10',
  publicLockVersionToDeploy: 13,
  publicProvider: 'https://mainnet.optimism.io',
  startBlock: 302400,
  subgraph: {
    endpoint:
      'https://api.studio.thegraph.com/query/65299/unlock-protocol-optimism/version/latest',
    studioName: 'unlock-protocol-optimism',
  },
  swapPurchaser: '0x72381052e4F7765A00a403891420BF75876c75bB',
  tokens: [
    {
      address: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
      decimals: 6,
      name: 'USD Coin',
      symbol: 'USDC',
    },
    {
      address: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
      decimals: 6,
      featured: true,
      name: 'USD Coin',
      symbol: 'USDC',
    },
    {
      address: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
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
      address: '0xdC6fF44d5d932Cbd77B52E5612Ba0529DC6226F1',
      decimals: 18,
      name: 'Worldcoin',
      symbol: 'WLD',
    },
    {
      address: '0x4200000000000000000000000000000000000042',
      decimals: 18,
      name: 'Optimism',
      symbol: 'OP',
    },
    {
      address: '0x4200000000000000000000000000000000000006',
      decimals: 18,
      name: 'Wrapped Ether',
      symbol: 'WETH',
    },
    {
      address: '0x68f180fcCe6836688e9084f035309E29Bf0A2095',
      decimals: 8,
      name: 'Wrapped BTC',
      symbol: 'WBTC',
    },
  ],
  uniswapV3: {
    factoryAddress: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
    oracle: '0x1FF7e338d5E582138C46044dc238543Ce555C963',
    positionManager: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
    quoterAddress: '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6',
    universalRouterAddress: '0xb555edF5dcF85f42cEeF1f3630a52A108E55A654',
  },
  unlockAddress: '0x99b1348a9129ac49c6de7F11245773dE2f51fB0c',
  url: 'https://www.optimism.io/',
}

export default optimism
