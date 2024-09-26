import { NetworkConfig } from '@unlock-protocol/types'

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
  hooks: {
    onKeyPurchaseHook: [],
  },
  id: 324,
  isTestNetwork: false,
  maxFreeClaimCost: 1,
  multisig: '0xFa5592CE9C52FA5214ccEa10cB72Faa88eC80a3c',
  name: 'zkSync Era',
  nativeCurrency: {
    coingecko: 'ethereum',
    decimals: 18,
    name: 'zkSync Ether',
    symbol: 'ETH',
  },
  previousDeploys: [],
  provider: 'https://rpc.unlock-protocol.com/324',
  publicLockVersionToDeploy: 14,
  publicProvider: 'https://mainnet.era.zksync.io',
  startBlock: 25905168,
  subgraph: {
    endpoint: 'https://subgraph.unlock-protocol.com/324',
    graphId: 'Bqo6hTg28TRmzksb6Eg8EPefD4sXBra1ad1WD4oz6c88',
    networkName: 'zksync-era',
    studioName: 'unlock-protocol-zksync',
  },
  tokens: [
    {
      address: '0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4',
      decimals: 6,
      name: 'Bridged USDC (zkSync)',
      symbol: 'USDC.e',
    },
    {
      address: '0x000000000000000000000000000000000000800A',
      decimals: 18,
      name: 'Ether',
      symbol: 'ETH',
    },
    {
      address: '0x4B9eb6c0b6ea15176BBF62841C6B2A8a398cb656',
      decimals: 18,
      name: 'Dai Stablecoin',
      symbol: 'DAI',
    },
    {
      address: '0x493257fD37EDB34451f62EDf8D2a0C418852bA4C',
      decimals: 6,
      name: 'Tether USD',
      symbol: 'USDT',
    },
    {
      address: '0xBBeB516fb02a01611cBBE0453Fe3c580D7281011',
      decimals: 8,
      name: 'Wrapped BTC',
      symbol: 'WBTC',
    },
  ],
  unlockAddress: '0x32CF553582159F12fBb1Ae1649b3670395610F24',
  url: 'https://zksync.io/',
}

export default zksync
