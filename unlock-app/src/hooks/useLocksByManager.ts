import { useQuery } from '@tanstack/react-query'
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
  manager: string | null | undefined,
  networkItems: [string, any][]
) => {
  const networks = networkItems.map(([network]) => Number(network))
  return useQuery({
    queryKey: ['getLocks', networks.join(','), manager],
    queryFn: async () => {
      if (!manager) {
        return []
      }
      return getLocksByNetworks({
        account: manager,
        networks,
      })
    },
    enabled: !!manager,
    retryOnMount: false,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}

export default useLocksByManagerOnNetworks
