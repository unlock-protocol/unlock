import React, { useEffect } from 'react'
import 'cross-fetch/polyfill'
import type { AppProps } from 'next/app'
import TagManager from 'react-gtm-module'
import { Toaster } from 'react-hot-toast'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from '~/config/app'
import GlobalWrapper from '../components/interface/GlobalWrapper'
import '../index.css'
import { ErrorBoundary } from '@sentry/nextjs'
import { ErrorFallback } from '~/components/interface/ErrorFallback'
import { queryClient } from '~/config/queryClient'

const UnlockApp = ({ Component }: AppProps) => {
  useEffect(() => {
    if (!config.isServer) {
      if (config.env === 'prod' && config.tagManagerArgs) {
        TagManager.initialize(config.tagManagerArgs)
      }
    }
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <GlobalWrapper>
        <ErrorBoundary fallback={(props) => <ErrorFallback {...props} />}>
          <Component />
        </ErrorBoundary>
        <Toaster />
      </GlobalWrapper>
    </QueryClientProvider>
  )
}

export default UnlockApp
