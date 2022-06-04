import { PaywallConfig } from '~/unlockTypes'
import { isValidPaywallConfig } from './checkoutValidators'

export function networkToLocksMap(paywallConfig: PaywallConfig) {
  const result = Object.entries(paywallConfig.locks).reduce<{
    [key: string]: {
      address: string
      name?: string
    }[]
  }>((acc, [address, { network, name }]) => {
    const networkId = Number(network || paywallConfig.network)
    const item = {
      name,
      address,
    }
    if (!acc[networkId]) {
      acc[networkId] = [item]
    } else {
      acc[networkId].push(item)
    }
    return acc
  }, {})

  return result
}

export function getPaywallConfigFromQuery(
  query: Record<string, any>
): PaywallConfig | undefined {
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
      return parsedConfig as PaywallConfig
    }
    console.error(
      'paywall config in URL does not pass validation, continuing with undefined'
    )
    return undefined
  }
  if (typeof query.lock === 'string') {
    return {
      title: query.title,
      network: Number(query.network),
      locks: {
        [query.lock]: {},
      },
    }
  }
}
