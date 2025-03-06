import { AxiosError } from 'axios'
import {
  QueryClient,
  isServer,
  defaultShouldDehydrateQuery,
} from '@tanstack/react-query'

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // Set a reasonable staleTime to prevent refetches
        refetchOnMount: false, // Prevent refetches on component mounts during navigation
        refetchIntervalInBackground: false,
        // Add retryDelay to space out retries and prevent flooding
        retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
        // Add longer gcTime to keep the cache around longer (5 minutes)
        gcTime: 5 * 60 * 1000,
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
      dehydrate: {
        // Include pending queries in dehydration for streaming
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === 'pending',
      },
    },
  })
}

// Keep a reference to the query client in the browser
let browserQueryClient: QueryClient | undefined = undefined

export function getQueryClient() {
  if (isServer) {
    // Always make a new query client on the server
    return makeQueryClient()
  } else {
    // For the browser, create the client only once
    if (!browserQueryClient) browserQueryClient = makeQueryClient()
    return browserQueryClient
  }
}

// Backward compatibility for existing code that expects a queryClient export
export const queryClient =
  typeof window === 'undefined' ? makeQueryClient() : getQueryClient()
