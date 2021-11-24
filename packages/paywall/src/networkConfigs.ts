import networks from '@unlock-protocol/networks'
import { NetworkConfigs } from '@unlock-protocol/types'

export const networkConfigs: NetworkConfigs = {}

Object.keys(networks)
  .map(Number)
  .forEach((chainId: number) => {
    const { provider, publicProvider, name } = networks[chainId as number]

    networkConfigs[chainId as number] = {
      id: chainId,
      name,
      publicProvider,
      provider,
    }
  })
