import { NetworkConfig } from '@unlock-protocol/types'

export const celo: NetworkConfig = {
  publicProvider: 'https://forno.celo.org',
  provider: 'https://rpc.unlock-protocol.com/42220',
  unlockAddress: '0x1FF7e338d5E582138C46044dc238543Ce555C963',
  multisig: '0xc293E2da9E558bD8B1DFfC4a7b174729fAb2e4E8',
  id: 42220,
  name: 'Celo',
  description:
    'Celo is a EVM compatible proof-of-stake blockchain designed for mobile with the ability to pay gas with tokens or stablecoins.',
  blockTime: 1000,
  subgraphURI: 'https://api.thegraph.com/subgraphs/name/unlock-protocol/celo',
  explorer: {
    name: 'Celoscan',
    urls: {
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
  },
  startBlock: 7179039,
  previousDeploys: [],
  isTestNetwork: false,
  teamMultisig: '0xc293E2da9E558bD8B1DFfC4a7b174729fAb2e4E8',
}

export default celo
