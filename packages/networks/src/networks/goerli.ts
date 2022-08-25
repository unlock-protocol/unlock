import { NetworkConfig } from '@unlock-protocol/types'

export const goerli: NetworkConfig = {
  publicProvider: 'https://goerli.prylabs.net',
  provider: 'https://rpc.unlock-protocol.com/5',
  unlockAddress: '0x627118a4fB747016911e5cDA82e2E77C531e8206',
  multisig: '0x95C06469e557d8645966077891B4aeDe8D55A755',
  id: 5,
  name: 'Goerli (Testnet)',
  blockTime: 1000,
  subgraphURI: 'https://api.thegraph.com/subgraphs/name/unlock-protocol/goerli',
  explorer: {
    name: 'Goerli (Testnet)',
    urls: {
      address: (address) => `https://goerli.etherscan.io/address/${address}`,
      transaction: (hash) => `https://goerli.etherscan.io/tx/${hash}`,
      token: (address, holder) =>
        `https://goerli.etherscan.io/token/${address}?a=${holder}`,
    },
  },
  opensea: {
    tokenUrl: (_lockAddress, _tokenId) => null,
  },
  requiredConfirmations: 12,
  erc20: null,
  baseCurrencySymbol: 'ETH',
  description: 'Main Ethereum test network. Do not use for production',
  locksmithUri: 'https://locksmith.unlock-protocol.com',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  startBlock: 7179039,
  previousDeploys: [],
  isTestNetwork: true,
  teamMultisig: '0x95C06469e557d8645966077891B4aeDe8D55A755',
}

export default goerli
