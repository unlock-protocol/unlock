import { HookType, NetworkConfig } from '@unlock-protocol/types'

export const optimism: NetworkConfig = {
  blockScan: {
    url: (address: string) => `https://blockscan.com/address/${address}`,
  },
  chain: 'optimism',
  dao: {
    chainId: 8453,
    governanceBridge: {
      connext: '0x8f7492DE823025b4CfaAB1D34c58963F2af5DEDA',
      domainId: 1869640809,
      modules: {
        connextMod: '0xF241F12506fb6Bf1909c6bC176A199166414007a',
        delayMod: '0xA8BB5AF09B599794136B14B112e137FAf83Acf1f',
      },
    },
    governor: '0x65bA0624403Fc5Ca2b20479e9F626eD4D78E0aD9',
  },
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
      {
        address: '0x7217b772788374391e890b773e6b8B7101b5Acde',
        id: HookType.PASSWORD_CAPPED,
        name: 'Passwords with caps. Multiple passwords can be used per contract',
      },
      {
        address: '0x6a0971717ABFfCfE08f67b53DeAC5D234A6676Ed',
        id: HookType.GITCOIN,
        name: 'Gitcoin',
      },
      {
        address: '0xA2D9BC1ffc560Cc6F21aC09E317A3186AC1B1db8',
        id: HookType.ALLOW_LIST,
        name: 'Allow List',
      },
    ],
    onTokenURIHook: [
      {
        address: '0x5765883E120F707A528F3e476636304De9280b6c',
        id: HookType.ADVANCED_TOKEN_URI,
        name: 'Advanced Token URI',
      },
    ],
  },
  id: 10,
  isTestNetwork: false,
  keyManagerAddress: '0x8c5D54B2CAA4C2D08B0DDF82a1e6D2641779B8EC',
  kickbackAddress: '0x981e0Ac8ABde773a72FeD793c1BEF99a53fAC342',
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
  publicLockVersionToDeploy: 14,
  publicProvider: 'https://mainnet.optimism.io',
  startBlock: 302400,
  subgraph: {
    endpoint: 'https://subgraph.unlock-protocol.com/10',
    graphId: '8heasZLjiLcTWtLTb7aFdWFe5yYZTgzLZfW76wrnTwrt',
    studioName: 'unlock-protocol-optimism',
  },
  tokens: [
    {
      address: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
      decimals: 6,
      featured: true,
      name: 'USD Coin',
      symbol: 'USDC',
    },
    {
      address: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
      decimals: 6,
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
    {
      address: '0xc709c9116dBf29Da9c25041b13a07A0e68aC5d2D',
      decimals: 18,
      name: 'Unlock Discount Token',
      symbol: 'UDT',
    },
  ],
  uniswapV3: {
    factoryAddress: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
    oracle: {
      100: '0xa55F8Ba16C5Bb580967f7dD94f927B21d0acF86c',
      3000: '0x1dA6c13515362B42ACb1Ad24a713f74f925F3AEB',
      500: '0xafF14D23630d5A4BF5e36e52847bE593F0f87672',
    },
    positionManager: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
    quoterAddress: '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6',
    universalRouterAddress: '0xb555edF5dcF85f42cEeF1f3630a52A108E55A654',
  },
  unlockAddress: '0x99b1348a9129ac49c6de7F11245773dE2f51fB0c',
  unlockDaoToken: {
    address: '0xc709c9116dBf29Da9c25041b13a07A0e68aC5d2D',
    mainnetBridge: '0x99C9fc46f92E8a1c0deC1b1747d010903E884bE1',
    uniswapV3Pool: '0x98b506bf1916f674a7BEC5284A043a21fCC3d206',
  },
  url: 'https://www.optimism.io/',
}

export default optimism
