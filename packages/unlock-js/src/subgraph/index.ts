import {
  getSdk,
  AllLocksQueryVariables,
  AllKeysQueryVariables,
} from '../@generated/subgraph'
import { GraphQLClient } from 'graphql-request'
import { NetworkConfigs } from '@unlock-protocol/types'
import { networks as networkConfigs } from '@unlock-protocol/networks'

interface QueryOptions {
  networks?: string[]
}

export class SubgraphService {
  networks: NetworkConfigs
  constructor(networks?: NetworkConfigs) {
    this.networks = networks || networkConfigs
  }

  createSdk(networkId = 1) {
    const network = this.networks[networkId]

    const client = new GraphQLClient(network.subgraph.endpointV2!)
    const sdk = getSdk(client)
    return sdk
  }

  async locks(variables: AllLocksQueryVariables, options?: QueryOptions) {
    const networks =
      options?.networks?.map((item) => this.networks[item]) ||
      Object.values(this.networks).filter((item) => item.id !== 31337)
    const items = await Promise.all(
      networks.map(async (config) => {
        const sdk = this.createSdk(config.id)
        const results = await sdk.allLocks(variables)
        return results.locks
      })
    )
    return items.flat()
  }

  async keys(variables: AllKeysQueryVariables, options?: QueryOptions) {
    const networks =
      options?.networks?.map((item) => this.networks[item]) ||
      Object.values(this.networks).filter((item) => item.id !== 31337)

    const items = await Promise.all(
      networks.map(async (config) => {
        const sdk = this.createSdk(config.id)
        const results = await sdk.AllKeys(variables)
        return results.keys
      })
    )
    return items.flat()
  }
}
