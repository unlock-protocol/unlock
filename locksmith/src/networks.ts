interface NetworkConfig {
  readOnlyProvider: string
  locksmithUri: string
  unlockAppUrl: string
}
export interface NetworkConfigs {
  [networkId: number]: NetworkConfig
}

export const networks: NetworkConfigs = {
  1: {
    readOnlyProvider:
      'https://eth-mainnet.alchemyapi.io/v2/b7Mxclz5hGyHqoeodGLQ17F5Qi97S7xJ',
    locksmithUri: 'https://locksmith.unlock-protocol.com',
    unlockAppUrl: 'https://app.unlock-protocol.com',
  },
  4: {
    readOnlyProvider:
      'https://eth-rinkeby.alchemyapi.io/v2/n0NXRSZ9olpkJUPDLBC00Es75jaqysyT',
    locksmithUri: 'https://rinkeby.locksmith.unlock-protocol.com',
    unlockAppUrl: 'https://app.unlock-protocol.com',
  },
  100: {
    readOnlyProvider: 'https://rpc.xdaichain.com/',
    locksmithUri: 'https://locksmith.unlock-protocol.com',
    unlockAppUrl: 'https://app.unlock-protocol.com',
  },
  1984: {
    readOnlyProvider: 'http://127.0.0.1:8545',
    locksmithUri: 'http://127.0.0.1:8080',
    unlockAppUrl: 'http://0.0.0.0:3000',
  },
}

export default networks
