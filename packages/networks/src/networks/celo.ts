import { NetworkConfig } from '@unlock-protocol/types'

export const celo: NetworkConfig = {
  publicProvider: 'https://forno.celo.org',
  provider: 'https://forno.celo.org',
  unlockAddress: '0x1FF7e338d5E582138C46044dc238543Ce555C963',
  multisig: '0x0D3e4e018ba92576dc021a1af0D7683122FA3A4c',
  id: 42220,
  name: 'Celo (Testnet)',
  description: 'Celo is a EVM compatible proof-of-stake blockchain designed for mobile with the ability to pay gas with tokens or stablecoins.',
  blockTime: 1000,
  subgraphURI: 'https://api.thegraph.com/subgraphs/name/unlock-protocol/celo',
  explorer: {
    name: 'Goerli (Testnet)',
    urls: {
      address: (address) =>
        `https://celoscan.io/address/${address}`,
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
  },
  startBlock: 7179039,
  previousDeploys: [],
  isTestNetwork: true,
}

export default celo
