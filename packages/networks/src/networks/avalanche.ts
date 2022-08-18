import { NetworkConfig } from '@unlock-protocol/types'

export const avalanche: NetworkConfig = {
  publicProvider: 'https://api.avax.network/ext/bc/C/rpc',
  provider: 'https://api.avax.network/ext/bc/C/rpc',
  unlockAddress: '0x70cBE5F72dD85aA634d07d2227a421144Af734b3',
  multisig: '0xEc7777C51327917fd2170c62873272ea168120Cb',
  id: 43114,
  name: 'Avalanche (C-Chain)',
  blockTime: 1000,
  subgraphURI:
    'https://api.thegraph.com/subgraphs/name/unlock-protocol/avalanche',
  explorer: {
    name: 'Snowtrace (Avalanche)',
    urls: {
      address: (address) => `https://snowtrace.io/address/${address}`,
      transaction: (hash) => `https://snowtrace.io/tx/${hash}`,
      token: (address, holder) =>
        `https://snowtrace.io/token/${address}?a=${holder}`,
    },
  },
  opensea: {
    tokenUrl: (_lockAddress, _tokenId) => null,
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
  isTestNetwork: false,
  description:
    'Avalanche is an open, programmable smart contracts platform for decentralized applications.',
}

export default avalanche
