import { NetworkConfigs } from '@unlock-protocol/types'

import * as supportedNetworks from './networks'

export * from './networks'

export const networks: NetworkConfigs = {}

Object.keys(supportedNetworks).forEach((networkName: string) => {
  // @ts-expect-error Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'typeof import("/Users/julien/repos/unlock/packages/networks/src/networks/index")'.
  const network = supportedNetworks[networkName]
  networks[network.id] = network
})

export default networks
