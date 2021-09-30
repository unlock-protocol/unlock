import { Paywall } from './Paywall'
import { setupUnlockProtocolVariable } from './utils'
import { networkConfigs } from './networkConfigs'

declare var PAYWALL_URL: string

const rawConfig = (window as any).unlockProtocolConfig
const baseUrl = PAYWALL_URL || 'localhost' // Set at build time
if (!rawConfig) {
  console.error(
    'Missing window.unlockProtocolConfig. See docs on how to configure your locks: https://docs.unlock-protocol.com/'
  )
} else {
  // set network based on hostname if missing in rawConfig
  if (!rawConfig.network) {
    if (baseUrl.match('staging-paywall.unlock-protocol.com')) {
      rawConfig.network = 4
      console.error(
        'Missing network in Unlock config. Assigned default to mainnet: 1. See https://docs.unlock-protocol.com/'
      )
    } else if (baseUrl.match('paywall.unlock-protocol.com')) {
      rawConfig.network = 1
      console.error(
        'Missing network in Unlock config. Assigned default to rinkeby 4. See https://docs.unlock-protocol.com/'
      )
    } else {
      console.error(
        'Missing network in Unlock config. Please set one. See https://docs.unlock-protocol.com/'
      )
    }
  } else {
    rawConfig.network = parseInt(rawConfig.network)
  }

  const paywall = new Paywall(rawConfig, networkConfigs)
  const { getState, getUserAccountAddress, loadCheckoutModal, resetConfig } =
    paywall

  setupUnlockProtocolVariable({
    loadCheckoutModal,
    resetConfig,
    getUserAccountAddress,
    getState,
  })
}
