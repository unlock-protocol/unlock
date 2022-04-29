import { PaywallConfig } from '../unlockTypes'
import { isValidPaywallConfig } from './checkoutValidators'
/* eslint-disable no-console */

export default function getConfigFromSearch(
  search: any
): PaywallConfig | undefined {
  if (typeof search.paywallConfig === 'string') {
    const rawConfig = search.paywallConfig
    const decodedConfig = decodeURIComponent(rawConfig)

    let parsedConfig: any

    try {
      parsedConfig = JSON.parse(decodedConfig)
      parsedConfig.minRecipients = parsedConfig?.minRecipients || 1
      parsedConfig.maxRecipients = parsedConfig?.maxRecipients || 1
    } catch (e) {
      console.error(
        'paywall config in URL not valid JSON, continuing with undefined'
      )
      return undefined
    }

    if (isValidPaywallConfig(parsedConfig)) {
      return parsedConfig as PaywallConfig
    }
    console.error(
      'paywall config in URL does not pass validation, continuing with undefined'
    )
    return undefined
  }
  if (typeof search.network === 'string' && typeof search.lock === 'string') {
    return {
      network: search.network,
      locks: {
        [search.lock]: {},
      },
    }
  }
}
