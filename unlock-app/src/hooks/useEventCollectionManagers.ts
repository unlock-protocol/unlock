import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { locksmith } from '~/config/locksmith'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { minifyAddress } from '@unlock-protocol/ui'

/**
 * Hook to manage event collection managers and fetch manager addresses.
 *
 * This hook provides functionality to:
 * 1. Add a new manager to the event collection
 * 2. Remove a manager from the event collection
 * 3. Fetch the list of manager addresses for the event collection
 *
 * @param slug - The unique identifier for the event collection.
 * @returns An object containing functions to add/remove managers, their loading states, and the query result for manager addresses.
 */
export function useEventCollectionManagers(slug: string) {
  const queryClient = useQueryClient()

  // Query to fetch manager addresses
  const managerAddressesQuery = useQuery<string[], Error>({
    queryKey: ['eventCollectionManagerAddresses', slug],
    queryFn: async (): Promise<string[]> => {
      const { data } = await locksmith.getEventCollection(slug)
      return data?.managerAddresses || []
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  })

  // Mutation to add a new manager
  const addManagerMutation = useMutation({
    mutationFn: (newManagerAddress: string) =>
      locksmith.addManagerToEventCollection(slug, {
        newManagerAddress,
      }),
    onSuccess: () => {
      ToastHelper.success('Manager added successfully.')
      queryClient.invalidateQueries({
        queryKey: ['eventCollectionManagerAddresses', slug],
      })
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Failed to add manager.'
      ToastHelper.error(message)
    },
  })

  // Mutation to remove a manager
  const removeManagerMutation = useMutation({
    mutationFn: (managerAddressToRemove: string) =>
      locksmith.removeManagerFromEventCollection(slug, {
        managerAddressToRemove,
      }),
    onSuccess: (_, managerAddressToRemove) => {
      ToastHelper.success(
        `Collection manager renounced for ${minifyAddress(managerAddressToRemove)}.`
      )
      queryClient.invalidateQueries({
        queryKey: ['eventCollectionManagerAddresses', slug],
      })
    },
    onError: (error: any, managerAddressToRemove) => {
      ToastHelper.error(
        `Can't renounce Collection manager for ${minifyAddress(managerAddressToRemove)}.`
      )
      console.error(error)
    },
  })

  return {
    collectionManagers: managerAddressesQuery.data,
    isLoadingCollectionManagers: managerAddressesQuery.isPending,
    collectionManagersError: managerAddressesQuery.error,
    addManager: addManagerMutation.mutateAsync,
    removeManager: removeManagerMutation.mutateAsync,
    isAddingManager: addManagerMutation.isPending,
    isRemovingManager: removeManagerMutation.isPending,
  }
}
