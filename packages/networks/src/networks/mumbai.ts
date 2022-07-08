import { NetworkConfig } from '@unlock-protocol/types'

export const mumbai: NetworkConfig = {
  publicProvider: 'https://matic-mumbai.chainstacklabs.com',
  provider: 'https://matic-mumbai.chainstacklabs.com',
  unlockAddress: '0x1FF7e338d5E582138C46044dc238543Ce555C963',
  multisig: '0x12E37A8880801E1e5290c815a894d322ac591607',
  id: 80001,
  name: 'Mumbai (Polygon)',
  blockTime: 1000,
  subgraphURI: 'https://api.thegraph.com/subgraphs/name/unlock-protocol/mumbai',
  explorer: {
    name: 'PolygonScan (Mumbai)',
    urls: {
      address: (address) => `https://mumbai.polygonscan.com/address/${address}`,
      transaction: (hash) => `https://mumbai.polygonscan.com/tx/${hash}`,
      token: (address, holder) =>
        `https://mumbai.polygonscan.com/token/${address}?a=${holder}`,
    },
  },
  requiredConfirmations: 12,
  erc20: null,
  baseCurrencySymbol: 'MATIC',
  locksmithUri: 'https://locksmith.unlock-protocol.com',
  nativeCurrency: {
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18,
  },
  startBlock: 26584912,
  previousDeploys: [],
  isTestNetwork: true,
}

export default mumbai
