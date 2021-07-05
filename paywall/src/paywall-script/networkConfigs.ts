import { NetworkConfigs } from '../unlockTypes'

declare var PAYWALL_URL: string

let unlockAppUrl
const baseUrl = PAYWALL_URL || 'localhost' // Set at build time

if (baseUrl.match('staging-paywall.unlock-protocol.com')) {
  unlockAppUrl = 'https://staging-app.unlock-protocol.com'
} else if (baseUrl.match('paywall.unlock-protocol.com')) {
  unlockAppUrl = 'https://app.unlock-protocol.com'
} else {
  unlockAppUrl = 'http://0.0.0.0:3000'
}

// TODO: allow customization of these values when running the script
// This means probably adding to the unlockProtocolConfig object to include the provider, loksmith Uri and unlockAppUrl
export const networkConfigs: NetworkConfigs = {
  1: {
    readOnlyProvider:
      'https://eth-mainnet.alchemyapi.io/v2/b7Mxclz5hGyHqoeodGLQ17F5Qi97S7xJ',
    locksmithUri: 'https://locksmith.unlock-protocol.com',
    unlockAppUrl,
  },
  4: {
    readOnlyProvider:
      'https://eth-rinkeby.alchemyapi.io/v2/n0NXRSZ9olpkJUPDLBC00Es75jaqysyT',
    locksmithUri: 'https://rinkeby.locksmith.unlock-protocol.com',
    unlockAppUrl,
  },
  100: {
    readOnlyProvider: 'https://rpc.xdaichain.com/',
    locksmithUri: 'https://locksmith.unlock-protocol.com',
    unlockAppUrl,
  },
  137: {
    readOnlyProvider:
      'https://snowy-weathered-waterfall.matic.quiknode.pro/5b11a0413a62a295070c0dfb25637d5f8c591aba/',
    locksmithUri: 'https://locksmith.unlock-protocol.com',
    unlockAppUrl,
  },
  1337: {
    readOnlyProvider: 'http://127.0.0.1:8545',
    locksmithUri: 'http://127.0.0.1:8080',
    unlockAppUrl,
  },
}
