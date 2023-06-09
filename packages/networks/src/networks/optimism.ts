import { HookType, NetworkConfig } from '@unlock-protocol/types'

export const optimism: NetworkConfig = {
  publicLockVersionToDeploy: 13,
  featured: true,
  publicProvider: 'https://mainnet.optimism.io',
  provider: 'https://rpc.unlock-protocol.com/10',
  unlockAddress: '0x99b1348a9129ac49c6de7F11245773dE2f51fB0c',
  multisig: '0x6E78b4447e34e751EC181DCBed63633aA753e145',
  keyManagerAddress: '0x8c5D54B2CAA4C2D08B0DDF82a1e6D2641779B8EC',
  id: 10,
  name: 'Optimism',
  chain: 'optimism',
  subgraph: {
    endpoint:
      'https://api.thegraph.com/subgraphs/name/unlock-protocol/optimism',
    endpointV2:
      'https://api.thegraph.com/subgraphs/name/unlock-protocol/optimism-v2',
  },
  explorer: {
    name: 'Etherscan',
    urls: {
      base: `https://optimistic.etherscan.io/`,
      address: (address) =>
        `https://optimistic.etherscan.io/address/${address}`,
      transaction: (hash) => `https://optimistic.etherscan.io/tx/${hash}`,
      token: (address, holder) =>
        `https://optimistic.etherscan.io/token/${address}?a=${holder}`,
    },
  },
  opensea: {
    tokenUrl: (_lockAddress, _tokenId) =>
      `https://opensea.io/assets/optimism/${_lockAddress}/${_tokenId}`,
    collectionUrl: (lockAddress) =>
      `https://opensea.io/assets/optimism/${lockAddress}`,
  },
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
    coingecko: 'ethereum',
  },
  description:
    'Optimism is a Layer 2 Optimistic Rollup network designed to utilize the strong security guarantees of Ethereum while reducing its cost and latency.',
  url: 'https://www.optimism.io/',
  isTestNetwork: false,
  maxFreeClaimCost: 10,
  uniswapV3: {
    factoryAddress: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
    quoterAddress: '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6',
    oracle: '0x1FF7e338d5E582138C46044dc238543Ce555C963',
    universalRouterAddress: '0xb555edF5dcF85f42cEeF1f3630a52A108E55A654',
  },
  swapPurchaser: '0x72381052e4F7765A00a403891420BF75876c75bB',
  wrappedNativeCurrency: {
    name: 'Wrapped Ether',
    symbol: 'WETH',
    decimals: 18,
    address: '0x4200000000000000000000000000000000000006',
  },
  tokens: [
    {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
      address: '0x0000000000000000000000000000000000000000',
    },
    {
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6,
      address: '0x7f5c764cbc14f9669b88837ca1490cca17c31607',
    },
    {
      name: 'Tether',
      symbol: 'USDT',
      decimals: 6,
      address: '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58',
    },
    {
      name: 'Dai',
      symbol: 'DAI',
      decimals: 18,
      address: '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1',
    },
  ],
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
      {
        id: HookType.GUILD,
        name: 'Guild',
        address: '0x1402D55BF0D6566ca8F569041000a8015b608632',
      },
    ],
  },
}

export default optimism
