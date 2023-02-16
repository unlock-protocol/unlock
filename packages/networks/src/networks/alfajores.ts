import { NetworkConfig } from '@unlock-protocol/types'

export const alfajores: NetworkConfig = {
  publicProvider: 'https://alfajores-forno.celo-testnet.org',
  provider: 'https://rpc.unlock-protocol.com/44787',
  unlockAddress: '',  
  multisig: '',
  keyManagerAddress: '',
  id: 44787,
  name: 'Alfajores (Celo)',
  chain: 'alfajores',
  description:
    'Celo is a EVM compatible proof-of-stake blockchain designed for mobile with the ability to pay gas with tokens or stablecoins.',
  blockTime: 1000,
  subgraph: {
    endpoint: 'https://api.thegraph.com/subgraphs/name/unlock-protocol/alfajores',
    endpointV2:
      'https://api.thegraph.com/subgraphs/name/unlock-protocol/alfajores-v2',
  },
  explorer: {
    name: 'Celoscan (Alfajores)',
    urls: {
      base: `https://alfajores.celoscan.io/`,
      address: (address) => `https://alfajores.celoscan.io/address/${address}`,
      transaction: (hash) => `https://alfajores.celoscan.io/tx/${hash}`,
      token: (address, holder) =>
        `https://alfajores.celoscan.io/token/${address}?a=${holder}`,
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
  isTestNetwork: true,
  maxFreeClaimCost: 1,
  teamMultisig: '',
  uniswapV3: {
    factoryAddress: '0xAfE208a311B21f13EF87E33A90049fC17A7acDEc',
    quoterAddress: '0x82825d0554fA07f7FC52Ab63c961F330fdEFa8E8',
    oracle: '0x5108412Dd50A6ea79d2F13D5d1A23FDD9bF532db',
  },
  wrappedNativeCurrency: {
    name: 'Celo native asset',
    symbol: 'CELO',
    decimals: 18,
    address: '0xF194afDf50B03e69Bd7D057c1Aa9e10c9954E4C9',
  },
  tokens: [
    {
      name: 'Celo Dollar',
      symbol: 'cUSD',
      decimals: 18,
      address: '0x874069fa1eb16d44d622f2e0ca25eea172369bc1',
      mainnetAddress: '0x765de816845861e75a25fca122bb6898b8b1282a',
    },
    {
      name: 'Celo Euro',
      symbol: 'cEUR',
      decimals: 18,
      address: '0x10c892a6ec43a53e45d0b916b4b7d383b1b78c0f',
      mainnetAddress: '0xd8763cba276a3738e6de85b4b3bf5fded6d6ca73',
    },
    {
      name: 'Celo Real',
      symbol: 'cREAL',
      decimals: 18,
      address: '0xC5375c73a627105eb4DF00867717F6e301966C32',
      mainnetAddress: '0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787',
    },
  ],
}

export default alfajores
