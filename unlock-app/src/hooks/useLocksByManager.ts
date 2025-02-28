import { QueriesOptions, useQueries } from '@tanstack/react-query'
import { LockOrderBy } from '@unlock-protocol/unlock-js'
import { OrderDirection } from '@unlock-protocol/unlock-js'
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
        networks,
      }
    )
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

  const query: QueriesOptions<any> = {
    queryKey: ['getLocks', networks.join(','), manager],
    queryFn: async () =>
      await getLocksByNetworks({
        account: manager,
        networks,
      }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  }

  // Maintain backwards compatibility by wrapping the result in an array
  return useQueries({
    queries: [query],
  })
}

export default useLocksByManagerOnNetworks
