import { NetworkConfigs } from '@unlock-protocol/types'

import * as supportedNetworks from './networks'

export * from './networks'

export const networks: NetworkConfigs = {}

Object.keys(supportedNetworks).forEach((networkName: string) => {
  // @ts-expect-error
  const network = supportedNetworks[networkName]
  networks[network.id] = network
})

export default networks
