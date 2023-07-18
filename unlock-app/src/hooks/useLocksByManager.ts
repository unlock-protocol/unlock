import { QueriesOptions, useQueries } from '@tanstack/react-query'
import { SubgraphService } from '@unlock-protocol/unlock-js'

export const getLocksByNetwork = async ({ account: owner, network }: any) => {
  const service = new SubgraphService()
  return await service.locks(
    {
      first: 1000,
      where: {
        lockManagers_contains: [owner],
      },
      orderBy: 'createdAtBlock' as any,
      orderDirection: 'desc' as any,
    },
    {
      networks: [network],
    }
  )
}

const useLocksByManagerOnNetworks = (manager: string, networkItems: any[]) => {
  const queries: QueriesOptions<any>[] = networkItems.map(([network]) => {
    if (manager && network) {
      return {
        queryKey: ['getLocks', network, manager],
        queryFn: async () =>
          await getLocksByNetwork({
            account: manager!,
            network,
          }),
        refetchInterval: false,
      }
    }
  })
  return useQueries({
    queries,
  })
}

export default useLocksByManagerOnNetworks
