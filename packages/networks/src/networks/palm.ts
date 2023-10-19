import { NetworkConfig } from '@unlock-protocol/types'

export const palm: NetworkConfig = {
  blockScan: {
    url: (address: string) => `https://blockscan.com/address/${address}`,
  },
  chain: 'palm',
  description:
    'The Palm network is an Ethereum-compatible sidechain, built to serve as the foundation of a new scalable and sustainable ecosystem for NFTs. It is designed by, and for, Ethereum developers and features low gas costs and fast transaction finality.',
  explorer: {
    name: 'Palm Explorer',
    urls: {
      address: (address) => `https://explorer.palm.io/address/${address}`,
      base: `https://explorer.palm.io/`,
      token: (address, holder) =>
        `https://explorer.palm.io/token/${address}?a=${holder}`,
      transaction: (hash) => `https://explorer.palm.io/tx/${hash}`,
    },
  },
  featured: false,
  fullySubsidizedGas: true,
  id: 11297108109,
  isTestNetwork: false,
  keyManagerAddress: '0x70cBE5F72dD85aA634d07d2227a421144Af734b3',
  maxFreeClaimCost: 1,
  multisig: '0xABEAf8F93bEA2a2E65866CccC3060626eEc7d304',
  name: 'Palm',
  nativeCurrency: {
    coingecko: 'palm',
    decimals: 18,
    name: 'PALM',
    symbol: 'PALM',
  },
  opensea: {
    tokenUrl: (_lockAddress, _tokenId) => null,
  },
  previousDeploys: [],
  provider: 'https://rpc.unlock-protocol.com/11297108109',
  publicLockVersionToDeploy: 13,
  publicProvider:
    'https://palm-mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
  startBlock: 9856400,
  subgraph: {
    endpoint:
      'https://graph.palm.io/subgraphs/name/unlock-protocol/Palm-mainnet',
    endpointV2:
      'https://graph.palm.io/subgraphs/name/unlock-protocol/Palm-mainnet',
    networkName: 'palm-mainnet',
  },
  tokens: [
    {
      address: '0x726138359C17F1E56bA8c4F737a7CAf724F6010b',
      decimals: 18,
      name: 'Wrapped ETH',
      symbol: 'WETH',
    },
    {
      address: '0x4C1f6fCBd233241bF2f4D02811E3bF8429BC27B8',
      decimals: 18,
      name: 'Dai',
      symbol: 'DAI',
    },
  ],
  uniswapV3: {
    factoryAddress: '0x',
    oracle: '0x',
    quoterAddress: '0x',
  },
  unlockAddress: '0x0314E34345C2327aC753C5Bf0D0751Cf6C1BfdE2',
}

export default palm
