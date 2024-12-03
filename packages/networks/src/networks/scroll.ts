import { HookType, NetworkConfig } from '@unlock-protocol/types'

export const scroll: NetworkConfig = {
  chain: 'scroll',
  description:
    'Scroll seamlessly extends Ethereum’s capabilities through zero knowledge tech and EVM compatibility. The L2 network built by Ethereum devs for Ethereum devs.',
  explorer: {
    name: 'Scrollscan',
    urls: {
      address: (address) => `https://scrollscan.com/address/${address}`,
      base: 'https://scrollscan.com/',
      token: (address, holder) =>
        `https://etherscan.com/token/${address}?a=${holder}`,
      transaction: (hash) => `https://scrollscan.com/tx/${hash}`,
    },
  },
  featured: false,
  hooks: {
    onKeyPurchaseHook: [
      {
        address: '0xe87eFc02F26EFE45171afDBEc85D743FDB2Eb1FB',
        id: HookType.ALLOW_LIST,
        name: 'Allow List',
      },
    ],
  },
  id: 534352,
  isTestNetwork: false,
  maxFreeClaimCost: 500,
  multisig: '0x0feE9413A626a05a08AcB0E0e5D6A483e6A0a172',
  name: 'Scroll',
  nativeCurrency: {
    coingecko: 'ethereum',
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
    wrapped: '0x5300000000000000000000000000000000000004',
  },
  provider: 'https://rpc.unlock-protocol.com/534352',
  publicLockVersionToDeploy: 14,
  publicProvider: 'https://rpc.scroll.io',
  startBlock: 2937779,
  subgraph: {
    endpoint: 'https://subgraph.unlock-protocol.com/534352',
    graphId: '49qmkjKjv9qfvgkCQTbZcG5gYPhwybmMfRhNc8brKf4F',
    studioName: 'unlock-protocol-scroll',
  },
  tokens: [
    {
      address: '0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4',
      decimals: 6,
      featured: true,
      name: 'USD Coin',
      symbol: 'USDC',
    },
    {
      address: '0x5300000000000000000000000000000000000004',
      decimals: 18,
      featured: true,
      name: 'Wrapped Ether',
      symbol: 'WETH',
    },
    {
      address: '0xcA77eB3fEFe3725Dc33bccB54eDEFc3D9f764f97',
      decimals: 18,
      featured: true,
      name: 'Dai Stablecoin',
      symbol: 'DAI',
    },

    {
      address: '0xf55BEC9cafDbE8730f096Aa55dad6D22d44099Df',
      decimals: 6,
      name: 'Tether USD',
      symbol: 'USDT',
    },
    {
      address: '0x3C1BCa5a656e69edCD0D4E36BEbb3FcDAcA60Cf1',
      decimals: 8,
      featured: true,
      name: 'Wrapped BTC',
      symbol: 'WBTC',
    },
  ],
  unlockAddress: '0x259813B665C8f6074391028ef782e27B65840d89',
  url: 'https://scroll.io',
}

export default scroll
