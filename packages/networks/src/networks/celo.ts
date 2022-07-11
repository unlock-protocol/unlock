import { NetworkConfig } from '@unlock-protocol/types'

export const celo: NetworkConfig = {
  publicProvider: 'https://forno.celo.org',
  provider: 'https://forno.celo.org',
  unlockAddress: '0x1FF7e338d5E582138C46044dc238543Ce555C963',
  multisig: '0x0D3e4e018ba92576dc021a1af0D7683122FA3A4c',
  id: 42220,
  name: 'Celo (Testnet)',
  blockTime: 1000,
  subgraphURI: 'https://api.thegraph.com/subgraphs/name/unlock-protocol/celo',
  explorer: {
    name: 'Goerli (Testnet)',
    urls: {
      address: (address) =>
        `https://explorer.celo.org/address/${address}`,
      transaction: (hash) => `https://explorer.celo.org/tx/${hash}`,
      token: (address, holder) =>
        `https://explorer.celo.org/token/${address}?a=${holder}`,
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
