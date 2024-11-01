import { Inter } from 'next/font/google'
import './globals.css'
import '~/utils/bigint'
import Providers from './providers'
import TagManagerScript from '../src/components/TagManagerScript'
import { SpeedInsights } from '@vercel/speed-insights/next'

import { SHARED_METADATA } from '~/config/seo'
import { Metadata } from 'next'
import DashboardLayout from '~/components/interface/layouts/DashboardLayout'
import Script from 'next/script'

const inter = Inter({
  subsets: ['latin'],
  style: ['normal'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  ...SHARED_METADATA,
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        <Script src="https://js.stripe.com/v3/" defer />
      </head>
      <body>
        <Providers>
          <DashboardLayout>{children}</DashboardLayout>
        </Providers>
        <TagManagerScript />
        <SpeedInsights />
      </body>
    </html>
  )
}
