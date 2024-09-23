import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { EventCollection } from '@unlock-protocol/unlock-js'
import { locksmith } from '~/config/locksmith'
import { ToastHelper } from '~/components/helpers/toast.helper'

/**
 * Hook to create an event collection.
 *
 * This hook provides functionality to:
 * 1. Create a new event collection
 * 2. Handle success and error cases
 * 3. Invalidate relevant queries on success
 *
 * It uses React Query for efficient data mutation and cache management.
 *
 * @returns A mutation object for creating an event collection.
 */
export const useCreateEventCollection = () => {
  const queryClient = useQueryClient()

  const createEventCollectionMutation = useMutation({
    mutationFn: async (data: any): Promise<EventCollection> => {
      const { data: createdCollection } =
        await locksmith.createEventCollection(data)
      return createdCollection
    },
    onSuccess: () => {
      ToastHelper.success('Event collection created successfully.')
      queryClient.invalidateQueries({
        queryKey: ['createEventCollection'],
      })
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.error || 'Failed to create event collection.'
      ToastHelper.error(message)
    },
  })

  return {
    createEventCollection: createEventCollectionMutation.mutateAsync,
    isCreatingEventCollection: createEventCollectionMutation.isPending,
    success: createEventCollectionMutation.isSuccess,
  }
}

/**
 * Hook to fetch events for a given event collection.
 * Automatically caches the data and handles re-fetching as needed.
 *
 * @param slug - The unique identifier for the event collection.
 */
export const useEventCollectionEvents = (slug: string) => {
  return useQuery<EventCollection, Error>({
    queryKey: ['eventCollectionEvents', slug],
    queryFn: async (): Promise<any> => {
      const { data } = await locksmith.getEventCollection(slug)
      return data.events
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook to add an event to an existing event collection.
 *
 * This hook provides functionality to:
 * 1. Add a specified event to a given collection
 * 2. Handle success and error cases during the addition process
 * 3. Invalidate relevant queries upon successful addition
 *
 * @returns A mutation object for adding an event to a collection.
 */
export const useAddToEventCollection = () => {
  const queryClient = useQueryClient()

  const addToEventCollectionMutation = useMutation({
    mutationFn: async (params: {
      collectionSlug: string
      eventSlug: string
    }): Promise<any> => {
      const { collectionSlug, eventSlug } = params
      const { data: createdCollection } = await locksmith.addEventToCollection(
        collectionSlug,
        { eventSlug: eventSlug }
      )
      return createdCollection
    },
    onSuccess: (createdCollection) => {
      if (createdCollection.association.isApproved) {
        ToastHelper.success('Event added to collection successfully.')
      } else {
        ToastHelper.success('Your event has been successfully submitted.')
      }
      queryClient.invalidateQueries({
        queryKey: ['addEventToCollection'],
      })
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.error || 'Failed to add event to collection.'
      ToastHelper.error(message)
    },
  })

  return {
    addToEventCollection: addToEventCollectionMutation.mutateAsync,
    isAddingToEventCollection: addToEventCollectionMutation.isPending,
    success: addToEventCollectionMutation.isSuccess,
  }
}

/**
 * Hook to fetch unapproved events for an event collection via its slug.
 * Automatically caches the data and handles re-fetching as needed.
 *
 * @param slug - The unique identifier for the event collection.
 */
export const useEventCollectionUnapprovedEvents = (slug: string) => {
  return useQuery<EventCollection, Error>({
    queryKey: ['eventCollectionUnapprovedEvents', slug],
    queryFn: async (): Promise<any> => {
      const { data } = await locksmith.getUnapprovedEventsForCollection(slug)
      return data
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  })
}
