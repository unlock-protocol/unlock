import { NetworkConfig } from '@unlock-protocol/types'

export const baseSepolia: NetworkConfig = {
  blockScan: {
    url: (address: string) => `https://blockscan.com/address/${address}`,
  },
  chain: 'base-sepolia',
  description: 'A public testnet for Base.',
  explorer: {
    name: 'Base Sepolia Etherscan',
    urls: {
      address: (address: string) =>
        `https://sepolia.basescan.org/address/${address}`,
      base: `https://sepolia.basescan.org/`,
      token: (address: string, holder: string) =>
        `https://sepolia.basescan.org/token/${address}?a=${holder}`,
      transaction: (hash: string) => `https://sepolia.basescan.org/tx/${hash}`,
    },
  },
  featured: false,
  fullySubsidizedGas: true,
  hooks: {},
  id: 84532,
  isTestNetwork: true,
  keyManagerAddress: '',
  maxFreeClaimCost: 1000,
  multisig: '',
  name: 'Base Sepolia',
  nativeCurrency: {
    coingecko: 'ethereum',
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
  },

  previousDeploys: [],

  // provider: 'https://rpc.unlock-protocol.com/84532',
  provider: 'https://sepolia.base.org',

  publicLockVersionToDeploy: 13,

  publicProvider: 'https://sepolia.base.org',

  startBlock: 7889118,
  subgraph: {
    endpoint:
      'https://api.studio.thegraph.com/query/xxx/unlock-protocol-base-sepolia/version/latest',
    networkName: 'base-sepolia',
    studioName: 'unlock-protocol-base-sepolia',
  },
  swapPurchaser: '',
  tokens: [
    {
      address: '0x4200000000000000000000000000000000000006',
      decimals: 18,
      featured: true,
      mainnetAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      name: 'Wrapped Ether',
      symbol: 'WETH',
    },
    {
      address: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
      decimals: 6,
      featured: true,
      name: 'USDC',
      symbol: 'USDC',
    },
  ],
  unlockAddress: '0x259813B665C8f6074391028ef782e27B65840d89',
  unlockDaoToken: {
    address: '',
  },
}

export default baseSepolia
