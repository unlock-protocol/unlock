import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { locksmith } from '~/config/locksmith'

interface Options {
  lockAddress: string
  network: number
  recipients: string[]
  data: string[]
}

export const useCanClaim = (
  { recipients, data, network, lockAddress }: Options,
  queryOptions?: Omit<
    UseQueryOptions<boolean, Error, boolean, (string | number | string[])[]>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: ['canClaim', network, lockAddress, recipients, data],
    queryFn: async () => {
      try {
        const response = await locksmith.checkClaim(network, lockAddress, {
          recipients,
          data,
        })
        return !!response.data?.canClaim
      } catch (error) {
        console.error(error)
        return false
      }
    },
    ...queryOptions,
  })
}
