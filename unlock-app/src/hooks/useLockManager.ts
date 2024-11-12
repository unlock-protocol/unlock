import { useQueries, useQuery } from '@tanstack/react-query'
import { useAuthenticate } from './useAuthenticate'
import { useWeb3Service } from '~/utils/withWeb3Service'

interface UseLocKManagerProps {
  lockAddress: string
  network: number
  lockManagerAddress?: string
}

interface UseMultipleLockManagersProps {
  locks: Array<{ address: string; network: number }>
  lockManagerAddress?: string
}

/**
 * Check if currently authenticated user is manager and manager could give us the manager object for that lock if we need it.
 * @param {String} lockAddress - lock address
 * @param {String} network - lock address network ID
 *
 */
export const useLockManager = ({
  lockAddress,
  network,
  lockManagerAddress,
}: UseLocKManagerProps) => {
  const web3Service = useWeb3Service()
  const { account } = useAuthenticate()
  const addressToCheck = lockManagerAddress || account
  const {
    data: isManager = false,
    isPending,
    refetch,
  } = useQuery({
    queryKey: ['getLockManagerStatus', network, lockAddress, addressToCheck],
    queryFn: async () => {
      if (!addressToCheck || !lockAddress || !network) {
        return false
      }
      return web3Service.isLockManager(lockAddress, addressToCheck, network)
    },
    staleTime: 1000 * 60,
    enabled: !!lockAddress && !!network,
  }) // Cached for 1 minute!

  return {
    refetch,
    isManager,
    isPending,
  }
}

/**
 * Check if currently authenticated user is a manager for any of the multiple locks.
 * @param locks Array of lock addresses
 * @param lockManagerAddress Optional specific manager address
 */
export const useMultipleLockManagers = ({
  locks,
  lockManagerAddress,
}: UseMultipleLockManagersProps) => {
  const web3Service = useWeb3Service()
  const { account } = useAuthenticate()
  const addressToCheck = lockManagerAddress || account

  const groupedLocks = locks.reduce(
    (acc, lock) => {
      const { network, address } = lock
      if (!acc[network]) {
        acc[network] = []
      }
      acc[network].push(address)
      return acc
    },
    {} as Record<number, string[]>
  )

  const queries = useQueries({
    queries: Object.entries(groupedLocks).flatMap(([network, addresses]) =>
      addresses.map((address) => ({
        queryKey: [
          'getLockManagerStatus',
          Number(network),
          address,
          addressToCheck,
        ],
        queryFn: async () => {
          if (!addressToCheck || !address || !network) {
            return false
          }
          return web3Service.isLockManager(
            address,
            addressToCheck,
            Number(network)
          )
        },
        staleTime: 1000 * 60,
        enabled: !!address && !!network,
      }))
    ),
  })

  // check if the user is a manager for any of the locks
  const isManager = queries.some((query) => query.data)
  const isPending = queries.some((query) => query.isLoading || query.isFetching)

  return {
    isManager,
    isPending,
    refetch: () => {
      queries.forEach((query) => query.refetch())
    },
  }
}
