interface NetworkConfig {
  provider: string
  locksmithUri: string
  unlockAppUrl: string
  unlockAddress?: string
  subgraphURI: string
}
export interface NetworkConfigs {
  [networkId: number]: NetworkConfig
}

export const networks: NetworkConfigs = {
  1: {
    provider:
      'https://eth-mainnet.alchemyapi.io/v2/b7Mxclz5hGyHqoeodGLQ17F5Qi97S7xJ',
    unlockAddress: '0x3d5409CcE1d45233dE1D4eBDEe74b8E004abDD13',
    locksmithUri: 'https://locksmith.unlock-protocol.com',
    unlockAppUrl: 'https://app.unlock-protocol.com',
    subgraphURI:
      'https://api.thegraph.com/subgraphs/name/unlock-protocol/unlock',
  },
  4: {
    provider:
      'https://eth-rinkeby.alchemyapi.io/v2/n0NXRSZ9olpkJUPDLBC00Es75jaqysyT',
    locksmithUri: 'https://rinkeby.locksmith.unlock-protocol.com',
    unlockAddress: '0xd8c88be5e8eb88e38e6ff5ce186d764676012b0b',
    unlockAppUrl: 'https://app.unlock-protocol.com',
    subgraphURI:
      'https://api.thegraph.com/subgraphs/name/unlock-protocol/unlock-rinkeby',
  },
  100: {
    provider: 'https://rpc.xdaichain.com/',
    locksmithUri: 'https://locksmith.unlock-protocol.com',
    unlockAppUrl: 'https://app.unlock-protocol.com',
    unlockAddress: '0x14bb3586Ce2946E71B95Fe00Fc73dd30ed830863',
    subgraphURI: 'https://api.thegraph.com/subgraphs/name/unlock-protocol/xdai',
  },
  137: {
    provider:
      'https://snowy-weathered-waterfall.matic.quiknode.pro/5b11a0413a62a295070c0dfb25637d5f8c591aba/',
    locksmithUri: 'https://locksmith.unlock-protocol.com',
    unlockAppUrl: 'https://app.unlock-protocol.com',
    unlockAddress: '0x14bb3586Ce2946E71B95Fe00Fc73dd30ed830863',
    subgraphURI:
      'https://api.thegraph.com/subgraphs/name/unlock-protocol/polygon',
  },
  1337: {
    provider: 'http://127.0.0.1:8545',
    locksmithUri: 'http://127.0.0.1:8080',
    unlockAppUrl: 'http://0.0.0.0:3000',
    subgraphURI: 'http://localhost:8000/subgraphs/name/unlock-protocol/unlock',
  },
}

export default networks
