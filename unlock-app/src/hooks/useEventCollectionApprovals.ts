import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { locksmith } from '~/config/locksmith'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { EventCollection } from '@unlock-protocol/unlock-js'

interface ApproveEventInput {
  slug: string
  eventSlug: string
}

interface BulkApproveEventsInput {
  slug: string
  eventSlugs: string[]
}

interface RemoveEventInput {
  slug: string
  eventSlug: string
}

interface BulkRemoveEventsInput {
  slug: string
  eventSlugs: string[]
}

/**
 * Utility hook for event collection approvals, unapproved events, and manager addresses.
 *
 * @param slug - The unique identifier for the event collection.
 * @returns An object containing mutation functions, their states, and unapproved events data for event collection approvals.
 */
export const useEventCollectionApprovals = (eventCollectionSlug: string) => {
  const queryClient = useQueryClient()

  // Query to fetch unapproved events
  const {
    data: unapprovedEvents,
    isLoading: isLoadingUnapprovedEvents,
    isError: isErrorUnapprovedEvents,
    error: errorUnapprovedEvents,
    refetch: refetchUnapprovedEvents,
  } = useQuery<EventCollection, Error>({
    queryKey: ['eventCollectionUnapprovedEvents', eventCollectionSlug],
    queryFn: async (): Promise<any> => {
      const { data } =
        await locksmith.getUnapprovedEventsForCollection(eventCollectionSlug)
      return data
    },
    enabled: !!eventCollectionSlug,
    staleTime: 5 * 60 * 1000,
  })

  // Approve an event
  const approveEventMutation = useMutation({
    mutationFn: async ({ eventSlug }: Omit<ApproveEventInput, 'slug'>) => {
      const response = await locksmith.approveEvent(eventCollectionSlug, {
        eventSlug,
      })
      return response
    },
    onSuccess: () => {
      ToastHelper.success('Event approved successfully!')
      queryClient.invalidateQueries({
        queryKey: ['eventCollectionUnapprovedEvents', eventCollectionSlug],
      })
    },
    onError: (error: any) => {
      ToastHelper.error(`Error approving event: ${error.message}`)
    },
  })

  // Bulk approve events
  const bulkApproveEventsMutation = useMutation({
    mutationFn: async ({
      eventSlugs,
    }: Omit<BulkApproveEventsInput, 'slug'>) => {
      const response = await locksmith.bulkApproveEvents(eventCollectionSlug, {
        eventSlugs,
      })
      return response
    },
    onSuccess: () => {
      ToastHelper.success('Events approved successfully!')
      queryClient.invalidateQueries({
        queryKey: ['eventCollectionUnapprovedEvents', eventCollectionSlug],
      })
    },
    onError: (error: any) => {
      ToastHelper.error(`Error approving events: ${error.message}`)
    },
  })

  // Remove an event
  const removeEventMutation = useMutation({
    mutationFn: async ({ eventSlug }: Omit<RemoveEventInput, 'slug'>) => {
      const response = await locksmith.removeEventFromCollection(
        eventCollectionSlug,
        {
          eventSlug,
        }
      )
      return response
    },
    onSuccess: () => {
      ToastHelper.success('Event removed successfully!')
      queryClient.invalidateQueries({
        queryKey: ['eventCollectionUnapprovedEvents', eventCollectionSlug],
      })
    },
    onError: (error: any) => {
      ToastHelper.error(`Error removing event: ${error.message}`)
    },
  })

  // Bulk remove events
  const bulkRemoveEventsMutation = useMutation({
    mutationFn: async ({ eventSlugs }: Omit<BulkRemoveEventsInput, 'slug'>) => {
      const response = await locksmith.bulkRemoveEvents(eventCollectionSlug, {
        eventSlugs,
      })
      return response
    },
    onSuccess: () => {
      ToastHelper.success('Events removed successfully!')
      queryClient.invalidateQueries({
        queryKey: ['eventCollectionUnapprovedEvents', eventCollectionSlug],
      })
    },
    onError: (error: any) => {
      ToastHelper.error(`Error removing events: ${error.message}`)
    },
  })

  return {
    unapprovedEvents,
    isLoadingUnapprovedEvents,
    isErrorUnapprovedEvents,
    errorUnapprovedEvents,
    refetchUnapprovedEvents,
    approveEvent: approveEventMutation.mutateAsync,
    isApprovingEvent: approveEventMutation.isPending,
    bulkApproveEvents: bulkApproveEventsMutation.mutateAsync,
    isBulkApprovingEvents: bulkApproveEventsMutation.isPending,
    removeEvent: removeEventMutation.mutateAsync,
    isRemovingEvent: removeEventMutation.isPending,
    bulkRemoveEvents: bulkRemoveEventsMutation.mutateAsync,
    isBulkRemovingEvents: bulkRemoveEventsMutation.isPending,
  }
}
