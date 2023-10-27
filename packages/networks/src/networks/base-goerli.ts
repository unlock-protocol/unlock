import { NetworkConfig } from '@unlock-protocol/types'

export const baseGoerli: NetworkConfig = {
  blockScan: {
    url: (address: string) => `https://blockscan.com/address/${address}`,
  },
  chain: 'base-goerli',
  description: 'Main Ethereum test network. Do not use for production.',
  explorer: {
    name: 'Base Goerli',
    urls: {
      address: (address: string) =>
        `https://goerli.basescan.org/address/${address}`,
      base: `https://goerli.basescan.org/`,
      token: (address: string, holder: string) =>
        `https://goerli.basescan.org/token/${address}?a=${holder}`,
      transaction: (hash: string) => `https://goerli.basescan.org/tx/${hash}`,
    },
  },
  featured: false,
  fullySubsidizedGas: true,
  id: 84531,
  isTestNetwork: true,
  keyManagerAddress: '0x70cBE5F72dD85aA634d07d2227a421144Af734b3',
  maxFreeClaimCost: 10000,
  multisig: '',
  name: 'Base Goerli (Testnet)',
  nativeCurrency: {
    coingecko: 'ethereum',
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
  },
  opensea: {
    collectionUrl: (lockAddress: string) =>
      `https://testnets.opensea.io/assets/goerli/${lockAddress}`,
    tokenUrl: (lockAddress: string, tokenId: string) =>
      `https://testnets.opensea.io/assets/goerli/${lockAddress}/${tokenId}`,
  },
  previousDeploys: [],
  provider: 'https://rpc.unlock-protocol.com/84531',
  publicLockVersionToDeploy: 13,
  publicProvider: 'https://goerli.base.org',
  startBlock: 2247300,
  subgraph: {
    endpoint:
      'https://api.studio.thegraph.com/query/44190/unlock-protocol-base-goerli/version/latest',
    endpointV2:
      'https://api.studio.thegraph.com/query/44190/unlock-protocol-base-goerli/version/latest',
    networkName: 'base-testnet',
    studioEndpoint: 'unlock-protocol-base-goerli',
  },
  unlockAddress: '0x51A1ceB83B83F1985a81C295d1fF28Afef186E02',
  url: 'https://docs.base.org/network-information#base-testnet',
}

export default baseGoerli
