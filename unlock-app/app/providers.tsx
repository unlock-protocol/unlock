'use client'

import React, { Suspense } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReCaptchaProvider } from 'next-recaptcha-v3'

import { AirstackProvider } from '@airstack/airstack-react'
import { ErrorBoundary } from '@sentry/nextjs'
import { ErrorFallback } from '~/components/interface/ErrorFallback'
import { ToastProvider } from '@unlock-protocol/ui'
import ShouldOpenConnectModal from '~/components/interface/connect/ShouldOpenConnectModal'
import GlobalWrapper from '~/components/interface/GlobalWrapper'
import { ConnectModalProvider } from '~/hooks/useConnectModal'
import Privy from '~/config/PrivyProvider'
import LoadingFallback from './Components/LoadingFallback'
import { getQueryClient } from '~/config/queryClient'
import { config } from '~/config/app'

export default function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient()

  return (
    <Privy>
      <QueryClientProvider client={queryClient}>
        <ReCaptchaProvider reCaptchaKey={config.recaptchaKey}>
          <GlobalWrapper>
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
          </GlobalWrapper>
        </ReCaptchaProvider>
      </QueryClientProvider>
    </Privy>
  )
}
