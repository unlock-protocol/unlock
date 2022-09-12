import { NetworkConfig } from '@unlock-protocol/types'

export const bsc: NetworkConfig = {
  publicProvider: 'https://bsc-dataseed.binance.org/',
  provider: 'https://rpc.unlock-protocol.com/56',
  unlockAddress: '0xeC83410DbC48C7797D2f2AFe624881674c65c856',
  id: 56,
  name: 'Binance Smart Chain',
  blockTime: 1000,
  multisig: '0x373D7cbc4F2700719DEa237500c7a154310B0F9B',
  subgraphURI: 'https://api.thegraph.com/subgraphs/name/unlock-protocol/bsc',
  explorer: {
    name: 'BscScan',
    urls: {
      address: (address) => `https://bscscan.com/address/${address}`,
      transaction: (hash) => `https://bscscan.com/tx/${hash}`,
      token: (address, holder) =>
        `https://bscscan.com/token/${address}?a=${holder}`,
    },
  },
  opensea: {
    tokenUrl: (_lockAddress, _tokenId) => null,
  },
  requiredConfirmations: 12,
  erc20: null,
  baseCurrencySymbol: 'BNB',
  locksmithUri: 'https://locksmith.unlock-protocol.com',
  nativeCurrency: {
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18,
  },
  startBlock: 13079000, // 12368889,
  previousDeploys: [
    {
      unlockAddress: '0x99b1348a9129ac49c6de7F11245773dE2f51fB0c',
      startBlock: 12396000,
    },
  ],
  description: 'EVM compatible network. Cheaper transaction cost.',
  isTestNetwork: false,
  teamMultisig: '0x373D7cbc4F2700719DEa237500c7a154310B0F9B',
  tokens: [
    {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
      address: '0x2170ed0880ac9a755fd29b2688956bd959f933f8',
    },
    {
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 18,
      address: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
    },
    {
      name: 'Tether',
      symbol: 'USDT',
      decimals: 18,
      address: '0x55d398326f99059ff775485246999027b3197955',
    },
    {
      name: 'Dai',
      symbol: 'DAI',
      decimals: 18,
      address: '0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3',
    },
  ],
}

export default bsc
