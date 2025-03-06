'use client'

import React, { Suspense } from 'react'
import {
  QueryClientProvider,
  QueryClient,
  isServer,
} from '@tanstack/react-query'
import { ReCaptchaProvider } from 'next-recaptcha-v3'

import { SessionProvider } from '~/hooks/useSession'
import { AirstackProvider } from '@airstack/airstack-react'
import { ErrorBoundary } from '@sentry/nextjs'
import { ErrorFallback } from '~/components/interface/ErrorFallback'
import { ToastProvider } from '@unlock-protocol/ui'
import ShouldOpenConnectModal from '~/components/interface/connect/ShouldOpenConnectModal'
import GlobalWrapper from '~/components/interface/GlobalWrapper'
import { ConnectModalProvider } from '~/hooks/useConnectModal'
import Privy from '~/config/PrivyProvider'
import LoadingFallback from './Components/LoadingFallback'
import { config } from '~/config/app'

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 60 * 1000,
        // Add a higher default gcTime to keep data in cache longer between navigations
        gcTime: 5 * 60 * 1000, // 5 minutes
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined = undefined

function getQueryClient() {
  if (isServer) {
    // Server: always make a new query client
    return makeQueryClient()
  } else {
    // Browser: make a new query client if we don't already have one
    // This is very important, so we don't re-make a new client if React
    // suspends during the initial render. This may not be needed if we
    // have a suspense boundary BELOW the creation of the query client
    if (!browserQueryClient) browserQueryClient = makeQueryClient()
    return browserQueryClient
  }
}

export default function Providers({ children }: { children: React.ReactNode }) {
  // Get the query client - this is now properly handling server/client environments
  const queryClient = getQueryClient()

  return (
    <Privy>
      <QueryClientProvider client={queryClient}>
        <ReCaptchaProvider reCaptchaKey={config.recaptchaKey}>
          <GlobalWrapper>
            <SessionProvider>
              <Suspense fallback={<LoadingFallback />}>
                <ConnectModalProvider>
                  <ToastProvider>
                    <AirstackProvider
                      apiKey={'162b7c4dda5c44afdb0857b6b04454f99'}
                    >
                      <ErrorBoundary
                        fallback={(props: any) => <ErrorFallback {...props} />}
                      >
                        <ShouldOpenConnectModal />
                        {children}
                      </ErrorBoundary>
                    </AirstackProvider>
                  </ToastProvider>
                </ConnectModalProvider>
              </Suspense>
            </SessionProvider>
          </GlobalWrapper>
        </ReCaptchaProvider>
      </QueryClientProvider>
    </Privy>
  )
}
