import {
  getSdk,
  AllLocksQueryVariables,
  AllKeysQueryVariables,
  AllReceiptsQueryVariables,
  Key_Filter,
  Key_OrderBy,
} from '../@generated/subgraph'
import { GraphQLClient } from 'graphql-request'
import { NetworkConfigs } from '@unlock-protocol/types'
import { networks as networkConfigs } from '@unlock-protocol/networks'

export {
  OrderDirection,
  Lock_OrderBy as LockOrderBy,
  Key_OrderBy as KeyOrderBy,
  Lock_Filter as LockFilter,
  Key_Filter as KeyFilter,
  Lock as SubgraphLock,
  Key as SubgraphKey,
} from '../@generated/subgraph'

interface QueryOptions {
  networks?: number[] | string[]
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
  /**
   * Get locks from multiple networks. By default, all networks will be queried.
   * If you want to query only specific network, you can pass options as the second parameter with network ids array.
   * ```ts
   * const service = new SubgraphService()
   * const locksOnMainnetAndGoerli = await service.locks({ first: 100, skip: 50, where: {}}, { networks: [1, 5] })
   * const locksOnAllNetworks = await service.locks({ first: 1000 })
   * ```
   */
  async locks(variables: AllLocksQueryVariables, options?: QueryOptions) {
    const networks =
      options?.networks?.map((item) => this.networks[item]) ||
      Object.values(this.networks).filter((item) => item.id !== 31337)
    const items = await Promise.all(
      networks.map(async (config) => {
        const sdk = this.createSdk(config.id)
        const results = await sdk.allLocks(variables)
        return results.locks.map((item) => ({
          ...item,
          network: config.id,
        }))
      })
    )
    return items.flat()
  }

  /**
   * Get locks with keys from multiple networks. By default, all networks will be queried.
   * If you want to query only specific network, you can pass options as the second parameter with network ids array.
   * ```ts
   * const service = new SubgraphService()
   * const locksKeysOnMainnetAndGoerli = await service.locksKeys({ first: 100, skip: 50, where: {}}, { networks: [1, 5] })
   * const locksKeysOnAllNetworks = await service.locksKeys({ first: 1000 })
   * ```
   */
  async locksKeys(
    variables: AllLocksQueryVariables & {
      keyFilter?: Key_Filter
      keyOrderBy?: Key_OrderBy
    },
    options?: QueryOptions
  ) {
    const networks =
      options?.networks?.map((item) => this.networks[item]) ||
      Object.values(this.networks).filter((item) => item.id !== 31337)
    const items = await Promise.all(
      networks.map(async (config) => {
        const sdk = this.createSdk(config.id)
        const results = await sdk.allLocksWithKeys(variables)
        return results.locks.map((item) => ({
          ...item,
          network: config.id,
        }))
      })
    )
    return items.flat()
  }

  /**
   * Get a single lock on a network. This is a helper provided on top of locks.
   */
  async lock(
    variables: Omit<AllLocksQueryVariables, 'first'>,
    options: { network: number }
  ) {
    const locks = await this.locks(variables, {
      networks: [options.network],
    })
    return locks?.[0]
  }

  /**
   * Get keys and associated lock data from multiple networks. By default, all networks will be queried.
   * If you want to query only specific network, you can pass options as the second parameter with network ids array.
   * ```ts
   * const service = new SubgraphService()
   * const keysOnMainnetAndGoerli = await service.keys({ first: 100, skip: 50, where: {}}, { networks: [1, 5] })
   * const keysOnAllNetworks = await service.keys({ first: 1000 })
   * ```
   */
  async keys(variables: AllKeysQueryVariables, options?: QueryOptions) {
    const networks =
      options?.networks?.map((item) => this.networks[item]) ||
      Object.values(this.networks).filter((item) => item.id !== 31337)

    const items = await Promise.all(
      networks.map(async (config) => {
        const sdk = this.createSdk(config.id)
        const results = await sdk.AllKeys(variables)
        return results.keys.map((item) => ({
          ...item,
          network: config.id,
        }))
      })
    )

    return items.flat()
  }

  /**
   * Get a single key on a network. This is a helper provided on top of keys.
   */
  async key(
    variables: Omit<AllKeysQueryVariables, 'first'>,
    options: Record<'network', number>
  ) {
    const keys = await this.keys(variables, { networks: [options.network] })
    return keys?.[0]
  }

  /** Get list or receipts from multiple networks */
  async receipts(variables: AllReceiptsQueryVariables, options?: QueryOptions) {
    const networks =
      options?.networks?.map((item) => this.networks[item]) ||
      Object.values(this.networks).filter((item) => item.id !== 31337)

    const items = await Promise.all(
      networks.map(async (config) => {
        const sdk = this.createSdk(config.id)
        const results = await sdk.AllReceipts(variables)
        return results.receipts.map((item) => ({
          ...item,
          network: config.id,
        }))
      })
    )
    return items.flat()
  }

  /** Get a single receipt for a specific network */
  async receipt(
    variables: Omit<AllReceiptsQueryVariables, 'first'>,
    options: { network: number }
  ) {
    const receipts = await this.receipts(variables, {
      networks: [options.network],
    })
    return receipts?.[0]
  }
}
