import { SpeedInsights } from '@vercel/speed-insights/next'
import React, { useEffect } from 'react'
import type { AppProps } from 'next/app'
import TagManager from 'react-gtm-module'
import { Toaster } from 'react-hot-toast'
import { QueryClientProvider } from '@tanstack/react-query'
import { config } from '~/config/app'
import GlobalWrapper from '../components/interface/GlobalWrapper'
import '../index.css'
import { ErrorBoundary } from '@sentry/nextjs'
import { ErrorFallback } from '~/components/interface/ErrorFallback'
import { queryClient } from '~/config/queryClient'
import { SessionProvider } from '~/hooks/useSession'
import { ConnectModalProvider } from '~/hooks/useConnectModal'

import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  style: ['normal'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

const UnlockApp = ({ Component, pageProps }: AppProps) => {
  useEffect(() => {
    if (!config.isServer) {
      if (config.env === 'prod' && config.tagManagerArgs) {
        TagManager.initialize(config.tagManagerArgs)
      }
    }
  }, [])

  return (
    <div className={inter.className}>
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          <ConnectModalProvider>
            <GlobalWrapper>
              <ErrorBoundary fallback={(props) => <ErrorFallback {...props} />}>
                <Component pageProps={pageProps} />
              </ErrorBoundary>
              <Toaster />
            </GlobalWrapper>
          </ConnectModalProvider>
        </SessionProvider>
      </QueryClientProvider>
      <SpeedInsights />
    </div>
  )
}

export default UnlockApp
