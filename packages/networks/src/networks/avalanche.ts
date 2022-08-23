import { NetworkConfig } from '@unlock-protocol/types'

export const avalanche: NetworkConfig = {
  publicProvider: 'https://api.avax.network/ext/bc/C/rpc',
  provider: 'https://api.avax.network/ext/bc/C/rpc',
  unlockAddress: '0xeaC0853562c3bda43C7264d7A67962d7Fcb4E5d0',
  multisig: '',
  id: 43114,
  name: 'Avalanche (C-Chain)',
  blockTime: 1000,
  subgraphURI: 'https://api.thegraph.com/subgraphs/name/unlock-protocol/avalanche',
  explorer: {
    name: 'Snowtrace (Avalanche)',
    urls: {
      address: (address) => `https://snowtrace.io/address/${address}`,
      transaction: (hash) => `https://snowtrace.io/tx/${hash}`,
      token: (address, holder) =>
        `https://snowtrace.io/token/${address}?a=${holder}`,
    },
  },
  requiredConfirmations: 12,
  erc20: null,
  baseCurrencySymbol: 'AVAX',
  locksmithUri: 'https://locksmith.unlock-protocol.com',
  nativeCurrency: {
    name: 'AVAX',
    symbol: 'AVAX',
    decimals: 18,
  },
  startBlock: 17188332,
  previousDeploys: [],
}

export default avalanche
