import { NetworkConfig } from '@unlock-protocol/types'

export const mainnet: NetworkConfig = {
  id: 1,
  publicProvider:
    'https://eth-mainnet.alchemyapi.io/v2/6idtzGwDtRbzil3s6QbYHr2Q_WBfn100', // Should we use Infura?
  provider:
    'https://eth-mainnet.alchemyapi.io/v2/6idtzGwDtRbzil3s6QbYHr2Q_WBfn100',
  unlockAddress: '0x3d5409CcE1d45233dE1D4eBDEe74b8E004abDD13',
  multisig: '0xa39b44c4AFfbb56b76a1BF1d19Eb93a5DfC2EBA9',
  name: 'Ethereum',
  blockTime: 8000,
  subgraphURI: 'https://api.thegraph.com/subgraphs/name/unlock-protocol/unlock',
  explorer: {
    name: 'Etherscan',
    urls: {
      address: (address) => `https://etherscan.io/address/${address}`,
      transaction: (hash) => `https://etherscan.io/tx/${hash}`,
      token: (address, holder) =>
        `https://etherscan.com/token/${address}?a=${holder}`,
    },
  },
  erc20: {
    symbol: 'DAI',
    address: '0x6b175474e89094c44da98b954eedeac495271d0f',
  },
  requiredConfirmations: 12,
  baseCurrencySymbol: 'Eth',
  locksmithUri: 'https://locksmith.unlock-protocol.com',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'Eth',
    decimals: 18,
  },
  startBlock: 7120795,
  description: 'The most popular chain',
}

export default mainnet
