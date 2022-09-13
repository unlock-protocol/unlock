import { NetworkConfig } from '@unlock-protocol/types'

export const mainnet: NetworkConfig = {
  id: 1,
  publicProvider: 'https://cloudflare-eth.com/v1/mainnet',
  provider: 'https://rpc.unlock-protocol.com/1',
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
  opensea: {
    tokenUrl: (lockAddress, tokenId) =>
      `https://opensea.io/assets/${lockAddress}/${tokenId}`,
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
  description: 'The most popular network',
  isTestNetwork: false,
  teamMultisig: '0xa39b44c4AFfbb56b76a1BF1d19Eb93a5DfC2EBA9',
  tokens: [
    {
      name: 'Wrapped Ether',
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      symbol: 'WETH',
      decimals: 18,
    },
    {
      name: 'Dai Stablecoin',
      address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      symbol: 'DAI',
      decimals: 18,
    },
    {
      name: 'USDCoin',
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      symbol: 'USDC',
      decimals: 6,
    },
    {
      address: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0',
      name: 'Polygon',
      symbol: 'MATIC',
      decimals: 18,
    },
    {
      name: 'Tether USD',
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      symbol: 'USDT',
      decimals: 6,
    },
    {
      name: 'Wrapped BTC',
      address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
      symbol: 'WBTC',
      decimals: 8,
    },
    {
      address: '0x0D8775F648430679A709E98d2b0Cb6250d2887EF',
      name: 'Basic Attention Token',
      symbol: 'BAT',
      decimals: 18,
    },
  ],
}

export default mainnet
