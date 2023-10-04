import { NetworkConfig } from '@unlock-protocol/types'

export const linea: NetworkConfig = {
  blockScan: {
    url: (address: string) => `https://blockscan.com/address/${address}`,
  },
  chain: 'linea',
  description:
    'Linea a Layer 2 zk-Rollup EVM-compatible chain powered by ConsenSys.',
  explorer: {
    name: 'Linea',
    urls: {
      address: (address: string) =>
        `https://lineascan.build/address/${address}`,
      base: `https://lineascan.build/`,
      token: (address: string, holder: string) =>
        `https://lineascan.build/token/${address}?a=${holder}`,
      transaction: (hash: string) => `https://lineascan.build/tx/${hash}`,
    },
  },
  featured: false,
  hooks: {},
  id: 59144,
  isTestNetwork: false,
  name: 'Linea',
  nativeCurrency: {
    coingecko: 'linea-eth',
    decimals: 18,
    name: 'Linea Ether',
    symbol: 'ETH',
  },
  previousDeploys: [],
  provider: 'https://rpc.linea.build',
  publicLockVersionToDeploy: 13,
  publicProvider: 'https://rpc.linea.build/',
  startBlock: 21986688,
  subgraph: {
    endpoint: 'https://api.thegraph.com/subgraphs/name/unlock-protocol/polygon',
    endpointV2:
      'https://api.thegraph.com/subgraphs/name/unlock-protocol/polygon-v2',
    networkName: 'matic',
  },
  swapPurchaser: '',
  tokens: [
    {
      address: '0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f',
      decimals: 18,
      name: 'Wrapped Ether',
      symbol: 'WETH',
    },
    {
      address: '0x4AF15ec2A0BD43Db75dd04E62FAA3B8EF36b00d5',
      decimals: 18,
      name: 'Dai Stablecoin',
      symbol: 'DAI',
    },
    {
      address: '0xA219439258ca9da29E9Cc4cE5596924745e12B93',
      decimals: 6,
      name: 'Tether USD',
      symbol: 'USDT',
    },
    {
      address: '0x176211869cA2b568f2A7D4EE941E073a821EE1ff',
      decimals: 6,
      name: 'USD Coin',
      symbol: 'USDC',
    },
    {
      address: '0x3aAB2285ddcDdaD8edf438C1bAB47e1a9D05a9b4',
      decimals: 8,
      name: 'Wrapped BTC',
      symbol: 'WBTC',
    },
  ],
  uniswapV3: {
    factoryAddress: '',
    oracle: '',
    quoterAddress: '',
    universalRouterAddress: '',
  },
  universalCard: {
    cardPurchaserAddress: '',
    stripeDestinationCurrency: 'usdc',
    stripeDestinationNetwork: '',
  },
  unlockAddress: '',
  url: 'https://linea.build/',
}

export default linea
