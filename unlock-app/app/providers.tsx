'use client'

import React, { Suspense } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReCaptchaProvider } from 'next-recaptcha-v3'

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
import { queryClient } from '~/config/queryClient'
import { config } from '~/config/app'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Privy>
      <QueryClientProvider client={queryClient}>
        <ReCaptchaProvider reCaptchaKey={config.recaptchaKey}>
          <GlobalWrapper>
            <SessionProvider>
              <Suspense fallback={<LoadingFallback />}>
                <ConnectModalProvider>
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
                </ConnectModalProvider>
                <Toaster />
              </Suspense>
            </SessionProvider>
          </GlobalWrapper>
        </ReCaptchaProvider>
      </QueryClientProvider>
    </Privy>
  )
}
