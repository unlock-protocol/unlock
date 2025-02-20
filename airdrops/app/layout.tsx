import { Inter } from 'next/font/google'
import './globals.css'
import { Metadata } from 'next'
import RootHeader from '../components/layout/Header'
import Providers from '../components/providers'
import Footer from '../components/layout/Footer'

const inter = Inter({
  subsets: ['latin'],
  style: ['normal'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
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
      <Providers>
        <body>
          <div className="overflow-hidden bg-ui-secondary-200 px-4 mx-auto lg:container">
            <RootHeader />
            <div className="flex flex-col gap-10 min-h-screen">{children}</div>
            <Footer />
          </div>
        </body>
      </Providers>
    </html>
  )
}
