import { useQuery } from '@tanstack/react-query'
import { locksmith } from '~/config/locksmith'
import { graphService } from '~/config/subgraph'

/**
 * Hook for fetching centralized lock data used across multiple components
 * to eliminate redundant subgraph requests
 */
export const useCentralizedLockData = (
  lockAddress?: string,
  network?: number,
  owner?: string,
  options = {
    staleTime: 1 * 60 * 1000, // 1 minute default stale time
  }
) => {
  return useQuery({
    queryKey: ['centralizedLockData', lockAddress, network, 'management'], // Added context to avoid collisions
    // Only run this query when we have valid lock parameters
    enabled: !!lockAddress && !!network && !!owner,
    queryFn: async () => {
      if (!network || !lockAddress) return null

      // Fetch all relevant lock data in a single query
      const [
        subgraphLock,
        lockSettingsResponse,
        eventDetailsResponse,
        metadataResponse,
      ] = await Promise.all([
        // Lock data from subgraph
        graphService.lock(
          {
            where: {
              address: lockAddress,
            },
          },
          { network }
        ),
        // Lock settings from locksmith
        locksmith.getLockSettings(network, lockAddress),
        // Event details if available
        locksmith
          .getEventDetails(network, lockAddress)
          .catch(() => ({ data: null })),
        // Metadata
        locksmith
          .lockMetadata(network, lockAddress)
          .catch(() => ({ data: {} })),
      ])

      // Check if the current user is a lock manager
      const isUserLockManager = subgraphLock?.lockManagers?.includes(
        owner?.toLowerCase()
      )

      return {
        lock: subgraphLock,
        lockSettings: lockSettingsResponse?.data || {},
        isManager: isUserLockManager,
        eventDetails: eventDetailsResponse?.data || null,
        metadata: metadataResponse?.data || {},
      }
    },
    staleTime: options.staleTime || 10 * 60 * 1000, // Use provided staleTime or default to 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes cache time
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Prevent refetching on mount
    retry: false, // Prevent retries which can cause multiple fetches
  })
}

export default useCentralizedLockData
