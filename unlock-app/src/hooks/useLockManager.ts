import { useQuery } from '@tanstack/react-query'
import networks from '@unlock-protocol/networks'
import { Web3Service } from '@unlock-protocol/unlock-js'
import { useAuth } from '~/contexts/AuthenticationContext'

interface UseLocKManagerProps {
  lockAddress: string
  network: number
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
  const { account } = useAuth()
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
      const web3Service = new Web3Service(networks)
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
