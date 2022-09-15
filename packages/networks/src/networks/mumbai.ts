import { NetworkConfig } from '@unlock-protocol/types'

export const mumbai: NetworkConfig = {
  publicProvider: 'https://matic-mumbai.chainstacklabs.com',
  provider: 'https://rpc.unlock-protocol.com/80001',
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
  opensea: {
    tokenUrl: (_lockAddress, _tokenId) => null,
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
  description: 'Polygon test network. Do not use for production',
  isTestNetwork: true,
  teamMultisig: '0x12E37A8880801E1e5290c815a894d322ac591607',
  tokens: [
    {
      name: 'Wrapped Ether',
      address: '0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa',
      symbol: 'WETH',
      decimals: 18,
    },
    {
      name: 'Wrapped Matic',
      address: '0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889',
      symbol: 'WMATIC',
      decimals: 18,
    },
  ],
}

export default mumbai
