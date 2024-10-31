import { config } from './app'
import { Metadata } from 'next'

// seo config for app router
export const SHARED_METADATA: Metadata = {
  title: {
    default: 'Unlock App',
    template: '%s | Unlock App',
  },
  description:
    'Unlock is a protocol which enables creators to monetize their content with a few lines of code in a fully decentralized way.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: config.unlockApp,
    siteName: 'Unlock App',
    images: [
      {
        url: `${config.unlockStaticUrl}/images/unlock.png`,
        alt: 'Unlock Protocol',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@UnlockProtocol',
    creator: '@UnlockProtocol',
  },
}
