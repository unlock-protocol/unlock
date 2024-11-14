import { QueriesOptions, useQueries } from '@tanstack/react-query'
import { LockOrderBy, SubgraphService } from '@unlock-protocol/unlock-js'
import { OrderDirection } from '@unlock-protocol/unlock-js'

interface GetLocksParams {
  account: string
  networks: number[]
}

// Batch request for multiple networks
export const getLocksByNetworks = async ({
  account,
  networks,
}: GetLocksParams) => {
  const service = new SubgraphService()
  try {
    return await service.locks(
      {
        first: 1000,
        where: {
          lockManagers_contains: [account],
        },
        orderBy: LockOrderBy.CreatedAtBlock,
        orderDirection: OrderDirection.Desc,
      },
      {
        networks, // Pass all networks at once
      }
    )
  } catch (error) {
    console.error('Failed to fetch locks:', error)
    return []
  }
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

  return useQueries({
    queries: [query],
  })
}

export default useLocksByManagerOnNetworks
