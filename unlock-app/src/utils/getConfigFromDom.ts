import { PaywallConfig } from '../unlockTypes'
import { isValidPaywallConfig } from './checkoutValidators'
/* eslint-disable no-console */

export interface WindowWithPaywallConfig {
  __unlockPaywalConfig__?: PaywallConfig
}

export default function getConfigFromDom(): PaywallConfig | undefined {
  if (!window || !(window as WindowWithPaywallConfig).__unlockPaywalConfig__) {
    return undefined
  }

  if (
    !isValidPaywallConfig(
      (window as WindowWithPaywallConfig).__unlockPaywalConfig__
    )
  ) {
    return undefined
  }

  return (window as WindowWithPaywallConfig)
    .__unlockPaywalConfig__ as PaywallConfig
}
