'use client'
import { Inter } from 'next/font/google'
import { usePathname } from 'next/navigation'

import './globals.css'
import '~/utils/bigint'
import Providers from './providers'

import TagManagerScript from '../src/components/TagManagerScript'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { PromptEmailLink } from '~/components/interface/PromptEmailLink'
import TermsOfServiceModal from '~/components/interface/layouts/index/TermsOfServiceModal'
import DashboardHeader from '~/components/interface/layouts/index/DashboardHeader'
import { ConnectModal } from '~/components/interface/connect/ConnectModal'
import { Container } from '~/components/interface/Container'
import DashboardFooter from '~/components/interface/layouts/index/DashboardFooter'

const inter = Inter({
  subsets: ['latin'],
  style: ['normal'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

// paths that shouldn't be wrapped in the default layout
const UNWRAPPED_PATHS = ['/checkout', '/demo']

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const shouldUnwrap = UNWRAPPED_PATHS.some((path) =>
    pathname?.startsWith(path)
  )

  return (
    <html lang="en" className={inter.className}>
      <body>
        <Providers>
          {shouldUnwrap ? (
            children
          ) : (
            <div className="overflow-hidden bg-ui-secondary-200">
              <TermsOfServiceModal />
              <Container>
                <ConnectModal />

                <DashboardHeader />

                <div className="flex flex-col gap-10 min-h-screen">
                  {children}
                </div>

                <DashboardFooter />
              </Container>
            </div>
          )}
          <PromptEmailLink />
        </Providers>
        <TagManagerScript />
        <SpeedInsights />
      </body>
    </html>
  )
}
