import { NetworkConfig } from '@unlock-protocol/types'

export const palm: NetworkConfig = {
  publicProvider:
    'https://palm-mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
  provider: 'https://rpc.unlock-protocol.com/11297108109',
  unlockAddress: '0x8e0B46ec3B95c81355175693dA0083b00fCc1326',
  multisig: '0x',
  id: 11297108109,
  name: 'Palm',
  chain: 'palm',
  blockTime: 5000,
  subgraph: {
    endpoint:
      'https://graph.palm.io/subgraphs/name/unlock-protocol/Palm-mainnet',
    networkName: 'palm-mainnet',
    endpointV2:
      'https://graph.palm.io/subgraphs/name/unlock-protocol/Palm-mainnet',
  },
  explorer: {
    name: 'Palm Explorer',
    urls: {
      base: `https://explorer.palm.io/`,
      address: (address) => `https://explorer.palm.io/address/${address}`,
      transaction: (hash) => `https://explorer.palm.io/tx/${hash}`,
      token: (address, holder) =>
        `https://explorer.palm.io/token/${address}?a=${holder}`,
    },
  },
  opensea: {
    tokenUrl: (_lockAddress, _tokenId) => null,
  },
  requiredConfirmations: 1,
  erc20: null,
  baseCurrencySymbol: 'PALM',
  locksmithUri: 'https://locksmith.unlock-protocol.com',
  nativeCurrency: {
    name: 'PALM',
    symbol: 'PALM',
    decimals: 18,
    coingecko: 'palm',
  },
  startBlock: 9856400,
  previousDeploys: [],
  isTestNetwork: false,
  maxFreeClaimCost: 1,
  description:
    'The Palm network is an Ethereum-compatible sidechain, built to serve as the foundation of a new scalable and sustainable ecosystem for NFTs. It is designed by, and for, Ethereum developers and features low gas costs and fast transaction finality.',
  uniswapV3: {
    factoryAddress: '0x',
    quoterAddress: '0x',
    oracle: '0x',
  },
  wrappedNativeCurrency: {
    name: 'Wrapped PALM',
    symbol: 'WPALM',
    decimals: 18,
    address: '0xF98cABF0a963452C5536330408B2590567611a71',
  },
  tokens: [
    {
      name: 'Wrapped ETH',
      symbol: 'WETH',
      decimals: 18,
      address: '0x726138359C17F1E56bA8c4F737a7CAf724F6010b',
    },
    {
      name: 'Dai',
      symbol: 'DAI',
      decimals: 18,
      address: '0x4C1f6fCBd233241bF2f4D02811E3bF8429BC27B8',
    },
  ],
}

export default palm
