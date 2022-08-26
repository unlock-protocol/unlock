import { NetworkConfig } from '@unlock-protocol/types'

export const optimisticKovan: NetworkConfig = {
  publicProvider: 'https://kovan.optimism.io',
  provider: 'https://rpc.unlock-protocol.com/69',
  unlockAddress: '0x99b1348a9129ac49c6de7F11245773dE2f51fB0c',
  id: 69,
  name: 'Optimistic Kovan',
  blockTime: 8000,
  subgraphURI: '',
  explorer: {
    name: 'Etherscan',
    urls: {
      address: (address) =>
        `https://kovan-optimistic.etherscan.io/address/${address}`,
      transaction: (hash) => `https://kovan-optimistic.etherscan.io/tx/${hash}`,
      token: (address, holder) =>
        `https://kovan-optimistic.etherscan.io/token/${address}?a=${holder}`,
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
  description: 'Optimism test network. Do not use for production.',
  isTestNetwork: true,
}

export default optimisticKovan
