'use client'

import { Inter } from 'next/font/google'

import './globals.css'
import '~/utils/bigint'
import Providers from './providers'

import { SessionProvider } from '~/hooks/useSession'
import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'
import { ConnectModalProvider } from '~/hooks/useConnectModal'
import { ErrorFallback } from '~/components/interface/ErrorFallback'
import ShouldOpenConnectModal from '~/components/interface/connect/ShouldOpenConnectModal'
import { AirstackProvider } from '@airstack/airstack-react'
import { ErrorBoundary } from '@sentry/nextjs'
import { Toaster } from 'react-hot-toast'
import GlobalWrapper from '~/components/interface/GlobalWrapper'

const inter = Inter({
  subsets: ['latin'],
  style: ['normal'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <Providers>
          <SessionProvider>
            <NextAuthSessionProvider>
              <ConnectModalProvider>
                <ErrorBoundary
                  fallback={(props: any) => <ErrorFallback {...props} />}
                >
                  <ShouldOpenConnectModal />
                  <AirstackProvider
                    apiKey={'162b7c4dda5c44afdb0857b6b04454f99'}
                  >
                    <GlobalWrapper>{children}</GlobalWrapper>
                  </AirstackProvider>
                </ErrorBoundary>
                <Toaster />
              </ConnectModalProvider>
            </NextAuthSessionProvider>
          </SessionProvider>
        </Providers>
      </body>
    </html>
  )
}
