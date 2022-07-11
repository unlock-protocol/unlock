import { NetworkConfig } from '@unlock-protocol/types'

export const arbitrum: NetworkConfig = {
  publicProvider: 'https://rpc.ankr.com/arbitrum',
  provider: 'https://rpc.ankr.com/arbitrum',
  unlockAddress: '0x1FF7e338d5E582138C46044dc238543Ce555C963',
  multisig: '0x310e9f9E3918a71dB8230cFCF32a083c7D9536d0',
  id: 42161,
  name: 'Arbitrum',
  blockTime: 1000,
  subgraphURI: 'https://api.thegraph.com/subgraphs/name/unlock-protocol/arbitrum',
  explorer: {
    name: 'Arbitrum',
    urls: {
      address: (address) =>
        `https://arbiscan.io/address/${address}`,
      transaction: (hash) => `https://arbiscan.io/tx/${hash}`,
      token: (address, holder) =>
        `https://arbiscan.io/token/${address}?a=${holder}`,
    },
  },
  opensea: {
    tokenUrl: (_lockAddress, _tokenId) => null,
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
  startBlock: 7179039,
  previousDeploys: [],
  isTestNetwork: true,
}

export default arbitrum
