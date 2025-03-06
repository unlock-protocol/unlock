import { QueriesOptions, useQueries } from '@tanstack/react-query'
import { LockOrderBy, OrderDirection } from '@unlock-protocol/unlock-js'
import { graphService } from '~/config/subgraph'

interface GetLocksParams {
  account: string
  networks: number[]
}

// Batch request for multiple networks
export const getLocksByNetworks = async ({
  account,
  networks,
}: GetLocksParams) => {
  try {
    // For now, only fetch locks for Base and Optimism
    const filteredNetworks = networks.filter(
      (network) =>
        // Base network ID is 8453, Optimism network ID is 10
        network === 8453 || network === 10
    )

    return graphService.locks(
      {
        first: 1000,
        where: {
          lockManagers_contains: [account],
        },
        orderBy: LockOrderBy.CreatedAtBlock,
        orderDirection: OrderDirection.Desc,
      },
      {
        networks: filteredNetworks,
      }
    )
  } catch (error) {
    console.error('Failed to fetch locks:', error)
    return []
  }
}

// Legacy support wrapper to maintain backwards compatibility
export const getLocksByNetwork = async ({ account, network }: any) => {
  // Only proceed if network is Base or Optimism
  if (Number(network) !== 8453 && Number(network) !== 10) {
    return []
  }

  const results = await getLocksByNetworks({
    account,
    networks: [Number(network)],
  })
  return results
}

const useLocksByManagerOnNetworks = (
  manager: string,
  networkItems: [string, any][],
  context: string = 'default'
) => {
  // Filter network items to only include Base and Optimism
  const filteredNetworkItems = networkItems.filter(
    ([network]) => Number(network) === 8453 || Number(network) === 10
  )

  const networks = filteredNetworkItems.map(([network]) => Number(network))
  const stableNetworks = [...networks].sort((a, b) => a - b)

  const query: QueriesOptions<any> = {
    queryKey: ['getLocksList', stableNetworks.join(','), manager, context],
    queryFn: async () =>
      await getLocksByNetworks({
        account: manager,
        networks: stableNetworks,
      }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 60 * 60 * 1000, // 60 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  }

  // Maintain backwards compatibility by wrapping the result in an array
  return useQueries({
    queries: [query],
  })
}

export default useLocksByManagerOnNetworks
