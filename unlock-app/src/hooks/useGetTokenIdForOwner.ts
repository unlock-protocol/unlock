import { useQuery } from '@tanstack/react-query'
import { useWeb3Service } from '~/utils/withWeb3Service'

interface Params {
  account?: string
  lockAddress?: string
  network?: number
}

export const useGetTokenIdForOwner = (
  { account, lockAddress, network }: Params,
  opts = {}
) => {
  const web3Service = useWeb3Service()
  return useQuery({
    queryKey: ['userTokenId', account, lockAddress, network],
    queryFn: async () => {
      if (!account || !lockAddress || !network) return
      return web3Service.getTokenIdForOwner(lockAddress, account!, network)
    },
    ...opts,
  })
}
