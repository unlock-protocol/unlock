import { useQuery } from '@tanstack/react-query'
import { useWeb3Service } from '~/utils/withWeb3Service'

interface ValidKeyProps {
  lockAddress: string
  network: number
  account?: string
}

export const useValidKey = ({
  lockAddress,
  network,
  account,
}: ValidKeyProps) => {
  const web3Service = useWeb3Service()
  return useQuery(
    ['hasValidKey', network, lockAddress, account],
    async () => {
      return web3Service.getHasValidKey(lockAddress, account!, network)
    },
    {
      enabled: !!account,
    }
  )
}
