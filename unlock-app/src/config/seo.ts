import type { DefaultSeoProps, NextSeoProps } from 'next-seo'
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

// seo config for pages directory
export const DEFAULT_SEO: DefaultSeoProps = {
  title: 'Unlock Protocol',
  description: 'Unlock',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: config.unlockApp,
    site_name: 'Unlock Protocol',
    images: [],
  },
  twitter: {
    handle: 'UnlockProtocol',
    site: 'UnlockProtocol',
    cardType: 'summary_large_image',
  },
}

interface SEOProps {
  title: string
  description?: string
  imagePath?: string
  twitter?: {
    handle?: string
    site?: string
    cardType?: string
  }
  path?: string
}

export function customizeSEO(options: SEOProps): NextSeoProps {
  const images = options.imagePath
    ? [
        // Twitter only fetch og:image if it is an absolute path with domain.
        {
          url: new URL(options.imagePath, config.unlockApp).toString(),
          alt: options.title,
        },
      ]
    : DEFAULT_SEO.openGraph?.images
  const path = options.path ?? '/'
  const url = new URL(path, config.unlockApp).toString()
  return {
    ...DEFAULT_SEO,
    ...options,
    twitter: {
      ...DEFAULT_SEO,
      handle: options.twitter?.handle || DEFAULT_SEO.twitter?.handle,
      site: options.twitter?.site || DEFAULT_SEO.twitter?.site,
    },
    openGraph: {
      ...DEFAULT_SEO.openGraph,
      images,
      url,
    },
  }
}
