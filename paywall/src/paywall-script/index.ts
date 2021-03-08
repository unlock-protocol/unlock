import { Paywall } from './Paywall'
import { setupUnlockProtocolVariable } from './utils'
import { networkConfigs } from './networkConfigs'

const rawConfig = (window as any).unlockProtocolConfig
if (!rawConfig) {
  console.error('Missing window.unlockProtocolConfig.')
} else {
  // set network based on hostname if missing in rawConfig
  if (!rawConfig.network) {
    if (window?.location?.hostname === 'paywall.unlock-protocol.com') {
      rawConfig.network = '1'
    } else if (
      window?.location?.hostname === 'staging-paywall.unlock-protocol.com'
    ) {
      rawConfig.network = '4'
    } else if (
      window?.location?.hostname === 'localhost' ||
      window?.location?.hostname === '127.0.0.1' ||
      window?.location?.hostname === '0.0.0.1' ||
      !window?.location?.hostname
    ) {
      rawConfig.network = '1492'
    } else {
      console.error('Missing network in Unlock config')
    }
  }

  const paywall = new Paywall(rawConfig, networkConfigs)
  const {
    getState,
    getUserAccountAddress,
    loadCheckoutModal,
    resetConfig,
  } = paywall

  setupUnlockProtocolVariable({
    loadCheckoutModal,
    resetConfig,
    getUserAccountAddress,
    getState,
  })
}
