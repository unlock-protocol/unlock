'use client'
import { Inter } from 'next/font/google'

import './globals.css'
import '~/utils/bigint'
import Providers from './providers'

import TagManagerScript from '../src/components/TagManagerScript'
import { SpeedInsights } from '@vercel/speed-insights/next'

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
        <Providers>{children}</Providers>
        <TagManagerScript />
        <SpeedInsights />
      </body>
    </html>
  )
}
