import { useQuery } from '@tanstack/react-query'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useWeb3Service } from '~/utils/withWeb3Service'

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
  const web3Service = useWeb3Service()
  const { account } = useAuth()

  const { data: isManager = false, isLoading } = useQuery(
    ['getLockManagerStatus', account, network, lockAddress],
    async () => {
      if (!account) {
        return false
      }
      return web3Service.isLockManager(lockAddress, account, network!)
    }
  )

  return {
    isManager,
    isLoading,
  }
}
