import { useQuery } from '@tanstack/react-query'
import { useStorageService } from '~/utils/withStorageService'

interface UseIsClaimableProps {
  lockAddress: string
  network: number
}
/**
 * Checks if a lock can be claimed by locksmith.
 * @param {String} lockAddress - lock address
 * @param {String} network - network ID
 *
 */
export const useIsClaimable = ({
  lockAddress,
  network,
}: UseIsClaimableProps) => {
  const storageService = useStorageService()

  const { isLoading, data: isClaimable } = useQuery(
    ['claim', lockAddress, network],
    () => {
      return storageService.canClaimMembership({
        network,
        lockAddress,
      })
    }
  )
  return {
    isLoading,
    isClaimable,
  }
}
