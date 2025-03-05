import { QueryClient, QueryCache } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import * as Sentry from '@sentry/nextjs'
import { ToastHelper } from '@unlock-protocol/ui'

// Custom query client with enhanced deduplication
export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error: any, query) => {
      const id = Sentry.captureException(error, {
        contexts: {
          query: {
            queryKey: query.queryKey,
          },
        },
      })

      console.debug(`Event ID: ${id}\n`, error)

      if (query?.meta?.errorMessage) {
        ToastHelper.error(query.meta.errorMessage as string)
      } else {
        switch (error?.code) {
          case -32000:
          case 4001:
          case 'ACTION_REJECTED':
            ToastHelper.error('Transaction rejected')
            break
          default: {
            const errorMessage = error?.error?.message || error.message
            console.error(errorMessage)
          }
        }
      }
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes (increased from 1 minute)
      gcTime: 10 * 60 * 1000, // 10 minutes (increased from 5 minutes)
      refetchInterval: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false, // Added to prevent refetches on component mounts during navigation
      refetchIntervalInBackground: false,
      // Add retryDelay to space out retries and prevent flooding
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
      retry: (failureCount, error) => {
        // More aggressive retry management
        if (failureCount > 1) {
          return false
        }
        if (error instanceof AxiosError) {
          return ![400, 401, 403, 404, 500].includes(
            error.response?.status || 0
          )
        }
        return false // Default to not retrying to prevent cascading requests
      },
    },
  },
})
