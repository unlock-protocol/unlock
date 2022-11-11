import { NetworkConfig } from '@unlock-protocol/types'

export const optimism: NetworkConfig = {
  publicProvider: 'https://mainnet.optimism.io',
  provider: 'https://rpc.unlock-protocol.com/10',
  unlockAddress: '0x99b1348a9129ac49c6de7F11245773dE2f51fB0c',
  multisig: '0x6E78b4447e34e751EC181DCBed63633aA753e145',
  id: 10,
  name: 'Optimism',
  blockTime: 8000,
  subgraph: {
    endpoint:
      'https://api.thegraph.com/subgraphs/name/unlock-protocol/optimism',
    endpointV2:
      'https://api.thegraph.com/subgraphs/name/unlock-protocol/optimism-v2',
  },
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
    tokenUrl: (_lockAddress, _tokenId) =>
      `https://opensea.io/assets/optimism/${_lockAddress}/${_tokenId}`,
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
  uniswapV3: {
    factoryAddress: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
    quoterAddress: '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6',
  },
  wrappedNativeCurrency: {
    name: 'Wrapped Ether',
    symbol: 'WETH',
    decimals: 18,
    address: '0x4200000000000000000000000000000000000006',
  },
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
