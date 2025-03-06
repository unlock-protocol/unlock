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
    // Fetch locks for all provided networks in parallel
    const lockPromises = networks.map((network) =>
      graphService.locks(
        {
          first: 1000,
          where: { lockManagers_contains: [account] },
          orderBy: LockOrderBy.CreatedAtBlock,
          orderDirection: OrderDirection.Desc,
        },
        { networks: [network] }
      )
    )
    const results = await Promise.all(lockPromises)
    return results.flat()
  } catch (error) {
    console.error('Failed to fetch locks:', error)
    return []
  }
}

// Legacy support wrapper to maintain backwards compatibility
export const getLocksByNetwork = async ({ account, network }: any) => {
  const results = await getLocksByNetworks({
    account,
    networks: [Number(network)],
  })
  return results
}

const useLocksByManagerOnNetworks = (
  manager: string,
  networkItems: [string, any][]
) => {
  const networks = networkItems.map(([network]) => Number(network))
  const stableNetworks = [...networks].sort((a, b) => a - b)

  const query: QueriesOptions<any> = {
    queryKey: ['getLocksList', stableNetworks.join(','), manager],
    queryFn: async () =>
      await getLocksByNetworks({
        account: manager,
        networks: stableNetworks,
      }),
    staleTime: 30 * 1000,
    cacheTime: 2 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    refetchInterval: 30 * 1000,
    refetchIntervalInBackground: false,
  }

  return useQueries({
    queries: [query],
  })
}

export default useLocksByManagerOnNetworks
