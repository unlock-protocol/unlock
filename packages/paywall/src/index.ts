import { Paywall } from './Paywall'
import { setupUnlockProtocolVariable } from './utils'
import { networkConfigs } from './networkConfigs'

const rawConfig = (window as any).unlockProtocolConfig

if (!rawConfig) {
  console.error(
    'Missing window.unlockProtocolConfig. See docs on how to configure your locks: https://docs.unlock-protocol.com/'
  )
} else {
  // set network based on hostname if missing in rawConfig
  if (!rawConfig.network) {
    rawConfig.network = 1
    console.info(
      'For backward compatibility setting default network to 1. See https://docs.unlock-protocol.com/'
    )
  } else {
    rawConfig.network = parseInt(rawConfig.network, 10)
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
