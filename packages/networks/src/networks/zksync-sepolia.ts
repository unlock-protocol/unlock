import { NetworkConfig } from '@unlock-protocol/types'

export const zksyncSepolia: NetworkConfig = {
  blockScan: {
    url: (address: string) => `https://blockscan.com/address/${address}`,
  },
  chain: 'zksyncSepolia',
  description:
    "zkSync is a Layer-2 protocol that scales Ethereum with cutting-edge ZK tech. Our mission is not only to merely increase Ethereum's throughput, but to fully preserve its foundational values – freedom, self-sovereignty, decentralization – at scale.",
  ethNetwork: 'sepolia',
  explorer: {
    name: 'zkSync Era Block Explorer - Sepolia',
    urls: {
      address: (address: string) =>
        `https://sepolia.explorer.zksync.io/address/${address}`,
      base: `https://sepolia.explorer.zksync.io/`,
      token: (address: string, holder: string) =>
        `https://sepolia.explorer.zksync.io/address/${address}?a=${holder}`,
      transaction: (hash: string) => `https://explorer.zksync.io/tx/${hash}`,
    },
  },
  featured: false,
  hooks: {},
  id: 300,
  isTestNetwork: false,
  maxFreeClaimCost: 1,
  multisig: 'TK',
  name: 'zkSync Era - Sepolia',
  nativeCurrency: {
    coingecko: 'zksync-eth',
    decimals: 18,
    name: 'zkSync Ether',
    symbol: 'ETH',
  },
  previousDeploys: [],
  provider: 'https://rpc.unlock-protocol.com/300',
  publicLockVersionToDeploy: 13,
  publicProvider: 'https://sepolia.era.zksync.dev',
  startBlock: 0,
  subgraph: {
    endpoint: '',
    endpointV2: '',
    networkName: 'matic',
  },
  tokens: [
    {
      address: '0x000000000000000000000000000000000000800A',
      decimals: 18,
      name: 'Wrapped Ether',
      symbol: 'WETH',
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
      address: '0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4',
      decimals: 6,
      name: 'USD Coin',
      symbol: 'USDC',
    },
    {
      address: '0xBBeB516fb02a01611cBBE0453Fe3c580D7281011',
      decimals: 8,
      name: 'Wrapped BTC',
      symbol: 'WBTC',
    },
  ],
  unlockAddress: '',
  url: 'https://sepolia.era.zksync.dev',
  verifyURL: 'https://explorer.sepolia.era.zksync.dev/contract_verification',
}

export default zksyncSepolia
