import { HookType, NetworkConfig } from '@unlock-protocol/types'

export const zksync: NetworkConfig = {
  blockScan: {
    url: (address: string) => `https://blockscan.com/address/${address}`,
  },
  chain: 'zksync',
  description:
    "zkSync is a Layer-2 protocol that scales Ethereum with cutting-edge ZK tech. Our mission is not only to merely increase Ethereum's throughput, but to fully preserve its foundational values – freedom, self-sovereignty, decentralization – at scale.",
  explorer: {
    name: 'zkSync Era Block Explorer',
    urls: {
      address: (address: string) =>
        `https://explorer.zksync.io/address/${address}`,
      base: `https://explorer.zksync.io/`,
      token: (address: string, holder: string) =>
        `https://explorer.zksync.io/token/${address}?a=${holder}`,
      transaction: (hash: string) => `https://explorer.zksync.io/tx/${hash}`,
    },
  },
  featured: false,
  hooks: {},
  id: 324,
  isTestNetwork: false,
  maxFreeClaimCost: 1,
  multisig: '0x479f3830fbd715342868BA95E438609BCe443DFB',
  name: 'Polygon',
  nativeCurrency: {
    coingecko: 'matic-network',
    decimals: 18,
    name: 'Matic',
    symbol: 'MATIC',
    wrapped: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
  },
  opensea: {
    collectionUrl: (lockAddress: string) =>
      `https://opensea.io/assets/matic/${lockAddress}`,
    tokenUrl: (lockAddress: string, tokenId: string) =>
      `https://opensea.io/assets/matic/${lockAddress}/${tokenId}`,
  },
  previousDeploys: [
    {
      startBlock: 15714206,
      unlockAddress: '0x14bb3586Ce2946E71B95Fe00Fc73dd30ed830863',
    },
  ],
  provider: 'https://rpc.unlock-protocol.com/137',
  publicLockVersionToDeploy: 13,
  publicProvider: 'https://polygon-rpc.com/',
  startBlock: 21986688,
  subgraph: {
    endpoint: 'https://api.thegraph.com/subgraphs/name/unlock-protocol/polygon',
    endpointV2:
      'https://api.thegraph.com/subgraphs/name/unlock-protocol/polygon-v2',
    networkName: 'matic',
  },
  swapPurchaser: '0x33aC9CAE1Cd9CBB191116607f564F7381d81BAD9',
  tokens: [
    {
      address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
      decimals: 18,
      name: 'Wrapped Ether',
      symbol: 'WETH',
    },
    {
      address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
      decimals: 18,
      name: 'Dai Stablecoin',
      symbol: 'DAI',
    },

    {
      address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      decimals: 6,
      name: 'Tether USD',
      symbol: 'USDT',
    },
    {
      address: '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359',
      decimals: 6,
      name: 'USD Coin',
      symbol: 'USDC',
    },
    {
      address: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',
      decimals: 8,
      name: 'Wrapped BTC',
      symbol: 'WBTC',
    },
  ],
  uniswapV3: {
    factoryAddress: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
    oracle: '0xE77c7F14e8EB9925ca418bF80c0a81a5B9C87683',
    positionManager: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
    quoterAddress: '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6',
    universalRouterAddress: '0x4C60051384bd2d3C01bfc845Cf5F4b44bcbE9de5',
  },
  universalCard: {
    cardPurchaserAddress: '0xAB355a589CFbBA7a21b91E5B6063bF822dCc0016',
    stripeDestinationCurrency: 'usdc',
    stripeDestinationNetwork: 'polygon',
  },
  unlockAddress: '0xE8E5cd156f89F7bdB267EabD5C43Af3d5AF2A78f',
  unlockDiscountToken: '0xf7E78d9C4c74df889A83C8C8d6D05BF70fF75876',
  url: 'https://polygon.technology/',
}

export default polygon
