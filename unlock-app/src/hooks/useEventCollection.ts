import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { EventCollection } from '@unlock-protocol/unlock-js'
import { locksmith } from '~/config/locksmith'
import { ToastHelper } from '~/components/helpers/toast.helper'

interface RemoveEventInput {
  collectionSlug: string
  eventSlug: string
}

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
    onMutate: () => {
      ToastHelper.success('Creating your event collection...')
    },
    onSuccess: () => {
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
    creationSuccess: createEventCollectionMutation.isSuccess,
  }
}

/**
 * Hook to fetch details of a given event collection.
 * Automatically caches the data and handles re-fetching as needed.
 *
 * @param slug - The unique identifier for the event collection.
 */
export const useEventCollectionDetails = (slug: string) => {
  return useQuery<EventCollection, Error>({
    queryKey: ['eventCollectionDetails', slug],
    queryFn: async (): Promise<any> => {
      const { data } = await locksmith.getEventCollection(slug)
      return data
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  })
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
export const useAddToEventCollection = (collectionSlug: string) => {
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
        queryKey: ['eventCollectionDetails', collectionSlug],
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
 * Hook to remove an event from an existing event collection.
 *
 * This hook provides functionality to:
 * 1. Remove a specified event from a given collection
 * 2. Handle success and error cases during the removal process
 * 3. Invalidate relevant queries upon successful removal
 *
 * @returns A mutation object for removing an event from a collection.
 */
export const useRemoveEventFromCollection = (collectionSlug: string) => {
  const queryClient = useQueryClient()

  const removeEventMutation = useMutation({
    mutationFn: async ({ eventSlug }: RemoveEventInput) => {
      const response = await locksmith.removeEventFromCollection(
        collectionSlug,
        {
          eventSlug,
        }
      )
      return response
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({
        queryKey: ['eventCollectionDetails', collectionSlug],
      })
      queryClient.invalidateQueries({
        queryKey: ['eventCollectionEvents', collectionSlug],
      })
      ToastHelper.success('Event removed successfully!')
    },
    onError: (error: any) => {
      ToastHelper.error(`Error removing event: ${error.message}`)
    },
  })

  return {
    removeEventFromCollection: removeEventMutation.mutateAsync,
    isRemovingEventFromCollection: removeEventMutation.isPending,
    success: removeEventMutation.isSuccess,
  }
}
