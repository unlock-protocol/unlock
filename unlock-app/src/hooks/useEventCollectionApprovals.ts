import { useMutation } from '@tanstack/react-query'
import { locksmith } from '~/config/locksmith'
import { ToastHelper } from '~/components/helpers/toast.helper'

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
 * Utility hook for event collection approvals and manager addresses.
 *
 * @returns An object containing mutation functions and their states for event collection approvals and manager addresses.
 */
export const useEventCollectionApprovals = () => {
  // Approve an event
  const approveEventMutation = useMutation({
    mutationFn: async ({ slug, eventSlug }: ApproveEventInput) => {
      const response = await locksmith.approveEvent(slug, { eventSlug })
      return response
    },
    onSuccess: (_data) => {
      ToastHelper.success('Event approved successfully!')
    },
    onError: (error: any) => {
      ToastHelper.error(`Error approving event: ${error.message}`)
    },
  })

  // Bulk approve events
  const bulkApproveEventsMutation = useMutation({
    mutationFn: async ({ slug, eventSlugs }: BulkApproveEventsInput) => {
      const response = await locksmith.bulkApproveEvents(slug, { eventSlugs })
      return response
    },
    onSuccess: () => {
      ToastHelper.success('Events approved successfully!')
    },
    onError: (error: any) => {
      ToastHelper.error(`Error approving events: ${error.message}`)
    },
  })

  // Remove an event
  const removeEventMutation = useMutation({
    mutationFn: async ({ slug, eventSlug }: RemoveEventInput) => {
      const response = await locksmith.removeEventFromCollection(slug, {
        eventSlug,
      })
      return response
    },
    onSuccess: (_data) => {
      ToastHelper.success('Event removed successfully!')
    },
    onError: (error: any) => {
      ToastHelper.error(`Error removing event: ${error.message}`)
    },
  })

  // Bulk remove events
  const bulkRemoveEventsMutation = useMutation({
    mutationFn: async ({ slug, eventSlugs }: BulkRemoveEventsInput) => {
      const response = await locksmith.bulkRemoveEvents(slug, { eventSlugs })
      return response
    },
    onSuccess: () => {
      ToastHelper.success('Events removed successfully!')
    },
    onError: (error: any) => {
      ToastHelper.error(`Error removing events: ${error.message}`)
    },
  })

  return {
    approveEvent: approveEventMutation.mutate,
    isApprovingEvent: approveEventMutation.isPending,
    bulkApproveEvents: bulkApproveEventsMutation.mutate,
    isBulkApprovingEvents: bulkApproveEventsMutation.isPending,
    removeEvent: removeEventMutation.mutate,
    isRemovingEvent: removeEventMutation.isPending,
    bulkRemoveEvents: bulkRemoveEventsMutation.mutate,
    isBulkRemovingEvents: bulkRemoveEventsMutation.isPending,
  }
}
