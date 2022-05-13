import { PaywallConfig } from '~/unlockTypes'

export function networkToLocksMap(paywallConfig: PaywallConfig) {
  const result = Object.entries(paywallConfig.locks).reduce<{
    [key: string]: {
      address: string
      name?: string
    }[]
  }>((acc, [address, { network, name }]) => {
    const networkId = network || paywallConfig.network
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
