import networks from '@unlock-protocol/networks'
import { NetworkConfigs } from '@unlock-protocol/types'

declare var PAYWALL_URL: string

let unlockAppUrl: string
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
export const networkConfigs: NetworkConfigs = {}

const chainIds = [1, 4, 100, 137, 31337]

chainIds.map((chainId) => {
  const { readOnlyProvider, provider, locksmithUri } = networks[chainId]

  networkConfigs[chainId] = {
    readOnlyProvider: readOnlyProvider || provider,
    locksmithUri: locksmithUri || '',
    unlockAppUrl,
  }
})
