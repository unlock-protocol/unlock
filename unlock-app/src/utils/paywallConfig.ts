import { PaywallConfigType } from '@unlock-protocol/core'
import { isValidPaywallConfig } from './checkoutValidators'

export function getPaywallConfigFromQuery(
  query: Record<string, any>
): PaywallConfigType | undefined {
  if (typeof query.paywallConfig === 'string') {
    const rawConfig = query.paywallConfig
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
      return parsedConfig as PaywallConfigType
    }
    console.error(
      'paywall config in URL does not pass validation, continuing with undefined'
    )
    return undefined
  }
  if (typeof query.lock === 'string') {
    return {
      title: query.title || 'Unlock Protocol',
      network: Number(query.network),
      locks: {
        [query.lock]: {},
      },
    }
  }
}
