import { Metadata } from 'next'
import { config } from './app'

// Shared metadata configuration for SEO
export const SHARED_METADATA: Metadata = {
  title: {
    default: config.appName.default,
    template: `%s | ${config.appName.brand}`,
  },
  description: config.descriptions.default,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: config.baseUrl,
    siteName: config.appName.default,
    images: [
      {
        url: config.images.default,
        alt: config.appName.full,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: config.social.twitter,
    creator: config.social.twitter,
  },
}
