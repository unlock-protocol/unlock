// this is used to compile the lib and distribute to CDN
import {
  Paywall,
  networkConfigs,
  setupUnlockProtocolVariable,
} from '@unlock-protocol/paywall'

if (typeof window !== 'undefined') {
  const rawConfig = window.unlockProtocolConfig

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
}
