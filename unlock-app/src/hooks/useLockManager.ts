import { useQuery } from '@tanstack/react-query'
import networks from '@unlock-protocol/networks'
import { Web3Service } from '@unlock-protocol/unlock-js'
import { useAuth } from '~/contexts/AuthenticationContext'

interface UseLocKManagerProps {
  lockAddress: string
  network: number
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
}: UseLocKManagerProps) => {
  const { account } = useAuth()
  const { data: isManager = false, isLoading } = useQuery(
    ['getLockManagerStatus', network, lockAddress, account],
    async () => {
      if (!account || !lockAddress || !network) {
        return false
      }
      const web3Service = new Web3Service(networks)
      return web3Service.isLockManager(lockAddress, account, network)
    },
    { staleTime: 1000 * 60 } // Cached for 1 minute!
  )

  return {
    isManager,
    isLoading,
  }
}
