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
import { Auth } from '~/components/helpers/Auth'

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
          <Auth>
            <Component />
          </Auth>
        </ErrorBoundary>
        <Toaster />
      </GlobalWrapper>
    </QueryClientProvider>
  )
}

export default UnlockApp
