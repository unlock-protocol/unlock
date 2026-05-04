import type { Metadata } from 'next'
import './globals.css'
import { AppShell } from '~/components/layout/AppShell'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'Unlock DAO Governance',
  description: 'Governance app foundation for the Unlock DAO.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  )
}
