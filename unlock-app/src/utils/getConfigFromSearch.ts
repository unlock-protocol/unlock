import { PaywallConfig } from '../unlockTypes'
import { isValidPaywallConfig } from './checkoutValidators'
/* eslint-disable no-console */

export default function getConfigFromSearch(
  search: any
): PaywallConfig | undefined {
  if (typeof search.paywallConfig !== 'string') {
    console.error('no paywall config found in URL, continuing with undefined')
    return undefined
  }

  const rawConfig = search.paywallConfig
  const decodedConfig = decodeURIComponent(rawConfig)

  let parsedConfig: any

  try {
    parsedConfig = JSON.parse(decodedConfig)
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
