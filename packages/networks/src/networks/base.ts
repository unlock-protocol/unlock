import { NetworkConfig, HookType } from '@unlock-protocol/types'

export const base: NetworkConfig = {
  blockScan: {
    url: (address: string) => `https://blockscan.com/address/${address}`,
  },
  chain: 'base',
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
    ],
  },
  id: 8453,
  isTestNetwork: false,
  keyManagerAddress: '0xD26c05a33349a6DeD02DD9360e1ef303d1246fb6',
  maxFreeClaimCost: 1,
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

  publicLockVersionToDeploy: 13,

  publicProvider: 'https://mainnet.base.org',

  startBlock: 1750000,
  subgraph: {
    endpoint:
      'https://api.studio.thegraph.com/query/44190/unlock-protocol-base/version/latest',
    endpointV2:
      'https://api.studio.thegraph.com/query/44190/unlock-protocol-base/version/latest',
    networkName: 'base',
    studioEndpoint: 'unlock-protocol-base',
  },
  tokens: [
    {
      address: '0x50c5725949a6f0c72e6c4a641f24049a917db0cb',
      decimals: 18,
      featured: true,
      name: 'Dai Stablecoin',
      symbol: 'DAI',
    },
    {
      address: '0xd9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca',
      decimals: 6,
      featured: true,
      name: 'USD Coin',
      symbol: 'USDC',
    },
  ],
  uniswapV3: {
    factoryAddress: '0x33128a8fC17869897dcE68Ed026d694621f6FDfD',
    positionManager: '0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1',
    universalRouterAddress: '0x198EF79F1F515F02dFE9e3115eD9fC07183f02fC',
  },
  unlockAddress: '0xd0b14797b9D08493392865647384974470202A78',
  url: 'https://base.org/',
}

export default base
