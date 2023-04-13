import { NetworkConfig } from '@unlock-protocol/types'

export const baseGoerli: NetworkConfig = {
  featured: true,
  publicProvider: 'https://goerli.base.org',
  provider: 'https://goerli.base.org', //'https://rpc.unlock-protocol.com/84531',
  unlockAddress: '0x51A1ceB83B83F1985a81C295d1fF28Afef186E02',
  multisig: '',
  keyManagerAddress: '',
  id: 84531,
  name: 'Base Goerli (Testnet)',
  chain: 'base-goerli',
  subgraph: {
    networkName: 'base-testnet',
    endpoint:
      'https://api.studio.thegraph.com/query/44190/unlock-protocol-base-goerli/0.0.1',
    endpointV2:
      'https://api.studio.thegraph.com/query/44190/unlock-protocol-base-goerli/0.0.1',
  },
  explorer: {
    name: 'Base Goerli',
    urls: {
      base: `https://goerli.basescan.org/`,
      address: (address: string) =>
        `https://goerli.basescan.org/address/${address}`,
      transaction: (hash: string) => `https://goerli.basescan.org/tx/${hash}`,
      token: (address: string, holder: string) =>
        `https://goerli.basescan.org/token/${address}?a=${holder}`,
    },
  },
  opensea: {
    tokenUrl: (lockAddress: string, tokenId: string) =>
      `https://testnets.opensea.io/assets/goerli/${lockAddress}/${tokenId}`,
    collectionUrl: (lockAddress: string) =>
      `https://testnets.opensea.io/assets/goerli/${lockAddress}`,
  },
  description: 'Main Ethereum test network. Do not use for production.',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
    coingecko: 'ethereum',
  },
  startBlock: 2247300,
  isTestNetwork: true,
  fullySubsidizedGas: true,
  maxFreeClaimCost: 10000,
}

export default baseGoerli
