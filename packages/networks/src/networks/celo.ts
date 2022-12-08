import { NetworkConfig } from '@unlock-protocol/types'

export const celo: NetworkConfig = {
  publicProvider: 'https://forno.celo.org',
  provider: 'https://rpc.unlock-protocol.com/42220',
  unlockAddress: '0x1FF7e338d5E582138C46044dc238543Ce555C963',
  multisig: '0xc293E2da9E558bD8B1DFfC4a7b174729fAb2e4E8',
  id: 42220,
  name: 'Celo',
  chain: 'celo',
  description:
    'Celo is a EVM compatible proof-of-stake blockchain designed for mobile with the ability to pay gas with tokens or stablecoins.',
  blockTime: 1000,
  subgraph: {
    endpoint: 'https://api.thegraph.com/subgraphs/name/unlock-protocol/celo',
    endpointV2:
      'https://api.thegraph.com/subgraphs/name/unlock-protocol/celo-v2',
  },
  explorer: {
    name: 'Celoscan',
    urls: {
      base: `https://celoscan.io/`,
      address: (address) => `https://celoscan.io/address/${address}`,
      transaction: (hash) => `https://celoscan.io/tx/${hash}`,
      token: (address, holder) =>
        `https://celoscan.io/token/${address}?a=${holder}`,
    },
  },
  opensea: {
    tokenUrl: (_lockAddress, _tokenId) => null,
  },
  requiredConfirmations: 12,
  erc20: null,
  baseCurrencySymbol: 'CELO',
  locksmithUri: 'https://locksmith.unlock-protocol.com',
  nativeCurrency: {
    name: 'CELO',
    symbol: 'CELO',
    decimals: 18,
    coingecko: 'celo',
  },
  startBlock: 7179039,
  previousDeploys: [],
  isTestNetwork: false,
  teamMultisig: '0xc293E2da9E558bD8B1DFfC4a7b174729fAb2e4E8',
  uniswapV3: {
    factoryAddress: '0xAfE208a311B21f13EF87E33A90049fC17A7acDEc',
    quoterAddress: '0x82825d0554fA07f7FC52Ab63c961F330fdEFa8E8',
    oracle: '0x5108412Dd50A6ea79d2F13D5d1A23FDD9bF532db',
  },
  wrappedNativeCurrency: {
    name: 'Celo native asset',
    symbol: 'CELO',
    decimals: 18,
    address: '0x471ece3750da237f93b8e339c536989b8978a438',
  },
  tokens: [
    {
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6,
      address: '0xef4229c8c3250c675f21bcefa42f58efbff6002a',
      mainnetAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    },
    {
      name: 'Dai Stablecoin',
      address: '0xE4fE50cdD716522A56204352f00AA110F731932d',
      symbol: 'DAI',
      decimals: 18,
      mainnetAddress: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    },
  ],
}

export default celo
