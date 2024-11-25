import { HookType, NetworkConfig } from '@unlock-protocol/types'

export const baseSepolia: NetworkConfig = {
  blockScan: {
    url: (address: string) => `https://blockscan.com/address/${address}`,
  },
  chain: 'base-sepolia',
  description: 'A public testnet for Base',
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
  faucets: [
    {
      name: 'Coinbase',
      url: 'https://portal.cdp.coinbase.com/products/faucet',
    },
    {
      name: 'Superchain',
      url: 'https://console.optimism.io/faucet',
    },
    {
      name: 'Alchemy',
      url: 'https://basefaucet.com/',
    },
  ],
  featured: false,
  fullySubsidizedGas: true,
  hooks: {
    onKeyPurchaseHook: [
      {
        address: '0x8c5D54B2CAA4C2D08B0DDF82a1e6D2641779B8EC',
        id: HookType.GITCOIN,
        name: 'Gitcoin',
      },
      {
        address: '0x72B427E751e711E9AbeD0F8aA1c28ec2034023F3',
        id: HookType.ALLOW_LIST,
        name: 'Allow List',
      },
    ],
    onTokenURIHook: [
      {
        address: '0x6878Ae3c863f6Ebd27B47C02F6B32aAC8B0BA07E',
        id: HookType.ADVANCED_TOKEN_URI,
        name: 'Advanced Token URI',
      },
    ],
  },
  id: 84532,
  isTestNetwork: true,
  keyManagerAddress: '',
  kickbackAddress: '0x930730F962133216353A989d9b6cfACb19FFB49D',
  maxFreeClaimCost: 1000,
  multisig: '0x68F2c5D9009dc4d553f814D689102a53B2b349Cc',
  name: 'Base Sepolia',

  nativeCurrency: {
    coingecko: 'ethereum',
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
  },

  previousDeploys: [],

  provider: 'https://rpc.unlock-protocol.com/84532',

  publicLockVersionToDeploy: 14,

  publicProvider: 'https://sepolia.base.org',
  startBlock: 7889118,
  subgraph: {
    endpoint: 'https://subgraph.unlock-protocol.com/84532',
    graphId: 'FxGJ2eFse3yhWpUMrBc4VzMqAgYamn49y1JQjZNugzZf',
    networkName: 'base-sepolia',
    studioName: 'unlock-protocol-base-sepolia',
  },
  tokens: [
    {
      address: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
      decimals: 6,
      faucet: { name: 'Circle', url: 'https://faucet.circle.com/' },
      featured: true,
      name: 'USDC',
      symbol: 'USDC',
    },
    {
      address: '0x4200000000000000000000000000000000000006',
      decimals: 18,
      featured: true,
      mainnetAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      name: 'Wrapped Ether',
      symbol: 'WETH',
    },
  ],
  unlockAddress: '0x259813B665C8f6074391028ef782e27B65840d89',
  unlockDaoToken: {
    address: '0x68a8011d72E6D41bf7CE9dC49De0aeaEBAAC9b39',
  },
}

export default baseSepolia
