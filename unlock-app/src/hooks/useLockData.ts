import { useQuery } from '@tanstack/react-query'
import { Lock } from '~/unlockTypes'
import { useWeb3Service } from '~/utils/withWeb3Service'

interface Options {
  lockAddress: string
  network: number
}

export const useLockData = ({ lockAddress, network }: Options) => {
  const web3Service = useWeb3Service()
  const { data: lock, isLoading: isLockLoading } = useQuery<Lock>(
    ['lock', lockAddress, network],
    async () => {
      const result = await web3Service.getLock(lockAddress, network)
      return {
        ...result,
        network,
      }
    },
    {
      refetchInterval: false,
    }
  )
  return {
    lock,
    isLockLoading,
  }
}
