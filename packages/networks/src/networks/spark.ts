import { NetworkConfig } from '@unlock-protocol/types'

export const spark: NetworkConfig = {
  blockScan: {
    url: (address: string) => `https://blockscan.com/address/${address}`,
  },
  chain: 'spark',
  description: 'A public testnet for Fuse.',
  explorer: {
    name: 'Spark Explorer',
    urls: {
      address: (address: string) =>
        `https://explorer.fusespark.io/address/${address}`,
      base: `https://explorer.fusespark.io/`,
      token: (address: string, holder: string) =>
        `https://explorer.fusespark.io/token/${address}?a=${holder}`,
      transaction: (hash: string) => `https://explorer.fusespark.io/tx/${hash}`,
    },
  },
  featured: false,
  fullySubsidizedGas: true,
  hooks: {},
  id: 123,
  isTestNetwork: true,
  keyManagerAddress: '',
  maxFreeClaimCost: 1000,
  multisig: '',
  name: 'Fuse Sparknet',
  nativeCurrency: {
    coingecko: 'ethereum',
    decimals: 18,
    name: 'Spark',
    symbol: 'SPARK',
  },

  previousDeploys: [],

  provider: 'https://rpc.fusespark.io/',

  publicLockVersionToDeploy: 14,

  publicProvider: 'https://rpc.fusespark.io/',

  startBlock: 0,
  subgraph: {
    endpoint: '<>', // this is given to you by the graph after deploying
    networkName: 'spark', // the graph name of the network see https://thegraph.com/docs/en/developing/supported-networks/
    studioName: 'unlock-protocol-spark', // the name of the graph
  },
  tokens: [
    {
      address: '0x149Dc53F280f654FEc99294944A81856970bcc93',
      decimals: 18,
      featured: true,
      mainnetAddress: '0x5622F6dC93e08a8b717B149677930C38d5d50682',
      name: 'Wrapped Ether',
      symbol: 'WETH',
    },
    {
      address: '0xAf914598D38921594017b0F85b8Ecc4FC13b520b',
      decimals: 6,
      featured: true,
      name: 'USDC',
      symbol: 'USDC',
    },
  ],
  unlockAddress: '',
  unlockDaoToken: {
    address: '',
  },
}

export default spark
