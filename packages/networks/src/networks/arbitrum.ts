import { NetworkConfig } from '@unlock-protocol/types'

export const arbitrum: NetworkConfig = {
  publicProvider: 'https://rpc.ankr.com/arbitrum',
  provider: 'https://rpc.unlock-protocol.com/42161',
  unlockAddress: '0x1FF7e338d5E582138C46044dc238543Ce555C963',
  multisig: '0x310e9f9E3918a71dB8230cFCF32a083c7D9536d0',
  id: 42161,
  name: 'Arbitrum',
  blockTime: 1000,
  subgraphURI:
    'https://api.thegraph.com/subgraphs/name/unlock-protocol/arbitrum',
  explorer: {
    name: 'Arbitrum',
    urls: {
      address: (address) => `https://arbiscan.io/address/${address}`,
      transaction: (hash) => `https://arbiscan.io/tx/${hash}`,
      token: (address, holder) =>
        `https://arbiscan.io/token/${address}?a=${holder}`,
    },
  },
  opensea: {
    tokenUrl: (_lockAddress, _tokenId) =>
      `https://opensea.io/assets/arbitrum/${_lockAddress}/${_tokenId}`,
  },
  requiredConfirmations: 12,
  erc20: null,
  baseCurrencySymbol: 'ETH',
  locksmithUri: 'https://locksmith.unlock-protocol.com',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  startBlock: 17429533,
  previousDeploys: [],
  isTestNetwork: false,
  description:
    'Arbitrum One is a Layer 2 (L2) chain running on top of Ethereum Mainnet that enables high-throughput, low cost smart contracts operations.',
  tokens: [
    {
      name: 'Ethereum',
      symbol: 'WETH',
      decimals: 18,
      address: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
    },
    {
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6,
      address: '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8',
    },
    {
      name: 'Tether',
      symbol: 'USDT',
      decimals: 6,
      address: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
    },
    {
      name: 'Dai',
      symbol: 'DAI',
      decimals: 18,
      address: '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1',
    },
    {
      name: 'Wrapped Bitcoin',
      symbol: 'WBTC',
      decimals: 8,
      address: '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f',
    },
  ],
}

export default arbitrum
