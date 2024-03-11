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
  console.log('useGetTokenIdForOwner', opts)
  return useQuery(
    ['userTokenId', account, lockAddress, web3Service],
    async () => {
      console.log('NOW!')
      console.log(account, lockAddress)
      if (!account || !lockAddress) return
      return web3Service.getTokenIdForOwner(lockAddress, account!, network)
    },
    opts
  )
}
