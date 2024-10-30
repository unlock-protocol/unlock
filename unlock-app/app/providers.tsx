'use client'

import React, { Suspense } from 'react'
import {
  isServer,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'

import { SessionProvider } from '~/hooks/useSession'
import { AirstackProvider } from '@airstack/airstack-react'
import { ErrorBoundary } from '@sentry/nextjs'
import { ErrorFallback } from '~/components/interface/ErrorFallback'
import { Toaster } from 'react-hot-toast'
import ShouldOpenConnectModal from '~/components/interface/connect/ShouldOpenConnectModal'
import GlobalWrapper from '~/components/interface/GlobalWrapper'
import { ConnectModalProvider } from '~/hooks/useConnectModal'
import Privy from '~/config/PrivyProvider'
import LoadingFallback from './Components/LoadingFallback'

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined = undefined

function getQueryClient() {
  if (isServer) {
    // Always create a new client on the server
    return makeQueryClient()
  } else {
    // Create client once in the browser to avoid re-instantiation
    if (!browserQueryClient) browserQueryClient = makeQueryClient()
    return browserQueryClient
  }
}

export default function Providers({ children }: { children: React.ReactNode }) {
  // Avoid useState for client init without a suspense boundary
  const queryClient = getQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <GlobalWrapper>
        <Privy>
          <SessionProvider>
            <Suspense fallback={<LoadingFallback />}>
              <ConnectModalProvider>
                <AirstackProvider apiKey={'162b7c4dda5c44afdb0857b6b04454f99'}>
                  <ErrorBoundary
                    fallback={(props: any) => <ErrorFallback {...props} />}
                  >
                    <ShouldOpenConnectModal />
                    {children}
                  </ErrorBoundary>
                </AirstackProvider>
              </ConnectModalProvider>
              <Toaster />
            </Suspense>
          </SessionProvider>
        </Privy>
      </GlobalWrapper>
    </QueryClientProvider>
  )
}
