import { NetworkConfig } from '@unlock-protocol/types'

export const optimism: NetworkConfig = {
  publicProvider: 'https://mainnet.optimism.io',
  provider: 'https://rpc.unlock-protocol.com/10',
  unlockAddress: '0x99b1348a9129ac49c6de7F11245773dE2f51fB0c',
  multisig: '0x6E78b4447e34e751EC181DCBed63633aA753e145',
  id: 10,
  name: 'Optimism',
  blockTime: 8000,
  subgraphURI:
    'https://api.thegraph.com/subgraphs/name/unlock-protocol/optimism',
  explorer: {
    name: 'Etherscan',
    urls: {
      address: (address) =>
        `https://optimistic.etherscan.io/address/${address}`,
      transaction: (hash) => `https://optimistic.etherscan.io/tx/${hash}`,
      token: (address, holder) =>
        `https://optimistic.etherscan.io/token/${address}?a=${holder}`,
    },
  },
  opensea: {
    tokenUrl: (_lockAddress, _tokenId) => null,
  },
  requiredConfirmations: 12,
  baseCurrencySymbol: 'Eth',
  locksmithUri: 'https://locksmith.unlock-protocol.com',
  nativeCurrency: {
    name: 'Eth',
    symbol: 'Eth',
    decimals: 18,
  },
  description: 'Layer 2 network. Cheaper transaction cost.',
  isTestNetwork: false,
  teamMultisig: '0x6E78b4447e34e751EC181DCBed63633aA753e145',
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
}

export default optimism
