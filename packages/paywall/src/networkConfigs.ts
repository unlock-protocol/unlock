import networks from '@unlock-protocol/networks'
import { NetworkConfigs } from '@unlock-protocol/types'

export const networkConfigs: NetworkConfigs = {}

Object.keys(networks)
  .map(Number)
  .forEach((chainId: number) => {
    const { provider, publicProvider, name, id, subgraph } =
      networks[chainId as number]

    networkConfigs[chainId as number] = {
      id,
      name,
      publicProvider,
      provider,
      subgraph,
    }
  })
