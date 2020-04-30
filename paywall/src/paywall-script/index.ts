import { Paywall } from './Paywall'
import { setupUnlockProtocolVariable } from './utils'

declare let __ENVIRONMENT_VARIABLES__: any
const moduleConfig: any = __ENVIRONMENT_VARIABLES__

const rawConfig = (window as any).unlockProtocolConfig
if (!rawConfig) {
  console.error('Missing window.unlockProtocolConfig.')
} else {
  const paywall = new Paywall(rawConfig, moduleConfig)
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
