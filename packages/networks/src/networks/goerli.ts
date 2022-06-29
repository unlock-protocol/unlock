import { NetworkConfig } from '@unlock-protocol/types'

export const goerli: NetworkConfig = {
  publicProvider: 'https://goerli.prylabs.net',
  provider: 'https://goerli.prylabs.net',
  unlockAddress: '0x1FF7e338d5E582138C46044dc238543Ce555C963',
  multisig: '0xC3EBAFD55BC599e614b729a582C371842cc8954a',
  id: 5,
  name: 'Goerli (Testnet)',
  blockTime: 1000,
  subgraphURI: 'https://api.thegraph.com/subgraphs/name/unlock-protocol/goerli',
  explorer: {
    name: 'Goerli (Testnet)',
    urls: {
      address: (address) => `https://https://goerli.etherscan.io/address/${address}`,
      transaction: (hash) => `https://https://goerli.etherscan.io/tx/${hash}`,
      token: (address, holder) =>
        `https://https://goerli.etherscan.io/token/${address}?a=${holder}`,
    },
  },
  requiredConfirmations: 12,
  erc20: null,
  baseCurrencySymbol: 'ETH',
  locksmithUri: 'https://locksmith.unlock-protocol.com',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  startBlock: 26584912,
  previousDeploys: [],
}

export default goerli
