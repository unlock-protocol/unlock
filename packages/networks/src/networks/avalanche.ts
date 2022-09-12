import { NetworkConfig } from '@unlock-protocol/types'

export const avalanche: NetworkConfig = {
  publicProvider: 'https://api.avax.network/ext/bc/C/rpc',
  provider: 'https://rpc.unlock-protocol.com/43114',
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
  tokens: [
    {
      name: 'Ethereum',
      symbol: 'WETH',
      decimals: 18,
      address: '0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab',
    },
    {
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6,
      address: '0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664',
    },
    {
      name: 'Tether',
      symbol: 'USDT',
      decimals: 6,
      address: '0xc7198437980c041c805a1edcba50c1ce5db95118',
    },
    {
      name: 'Dai',
      symbol: 'DAI',
      decimals: 18,
      address: '0xd586e7f844cea2f87f50152665bcbc2c279d8d70',
    },
    {
      name: 'Wrapped Bitcoin',
      symbol: 'WBTC',
      decimals: 8,
      address: '0x50b7545627a5162f82a992c33b87adc75187b218',
    },
  ],
}

export default avalanche
