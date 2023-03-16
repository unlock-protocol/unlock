import { useQuery } from '@tanstack/react-query'
import { SubgraphService } from '@unlock-protocol/unlock-js'
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

  const getLockManagerStatus = async () => {
    return await web3Service.isLockManager(lockAddress, account!, network!)
  }

  const { data: isManager = false, isLoading } = useQuery(
    ['getLockManagerStatus', account, network, lockAddress],
    async () => getLockManagerStatus()
  )

  return {
    isManager,
    isLoading,
  }
}

export const useLockManagers = ({
  lockAddress,
  network,
  tokenId,
}: {
  lockAddress: string
  network: number
  tokenId: string
}) => {
  const { isLoading, data: managers = [] } = useQuery(
    ['getManagers', lockAddress, network, tokenId],
    async () => {
      const subgraph = new SubgraphService()
      const result = await subgraph.key(
        {
          where: {
            lock: lockAddress,
            tokenId,
          },
        },
        {
          network,
        }
      )
      return result?.lock?.lockManagers ?? []
    }
  )

  return {
    isLoading,
    managers,
  }
}
