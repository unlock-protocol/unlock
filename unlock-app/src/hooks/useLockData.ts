import { useQuery, useQueries } from '@tanstack/react-query'
import { Lock } from '~/unlockTypes'
import { PaywallLocksConfigType } from '@unlock-protocol/core'
import { useWeb3Service } from '~/utils/withWeb3Service'

interface Options {
  lockAddress: string
  network: number
}

export const useLockData = ({ lockAddress, network }: Options) => {
  const web3Service = useWeb3Service()

  const { data: lock, isPending: isLockLoading } = useQuery({
    queryKey: ['lock', lockAddress, network],
    queryFn: async () => {
      const result = await web3Service.getLock(lockAddress, network)
      return {
        ...result,
        network,
      }
    },
    refetchInterval: false,
  })
  return {
    lock,
    isLockLoading,
  }
}

export const useMultipleLockData = (locks: PaywallLocksConfigType) => {
  const web3Service = useWeb3Service()
  const results = useQueries({
    queries: Object.keys(locks).map((lockAddress: string) => {
      const network = locks[lockAddress].network
      return {
        queryKey: ['lock', lockAddress, network],
        queryFn: async () => {
          return web3Service.getLock(lockAddress, network!) as Promise<Lock>
        },
      }
    }),
  })
  return results.map((result) => {
    return {
      lock: result.data,
      isLockLoading: result.isPending,
    }
  })
}
