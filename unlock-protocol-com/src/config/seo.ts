import type { DefaultSeoProps, NextSeoProps } from 'next-seo'

export const baseUrl = 'https://unlock-protocol.com'

export const DEFAULT_SEO: DefaultSeoProps = {
  title: 'Unlock',
  description:
    'Unlock is a protocol which enables creators to monetize their content with a few lines of code in a fully decentralized way.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: baseUrl,
    site_name: 'unlock-protocol',
    images: [
      {
        url: `${baseUrl}/images/unlock.png`,
        alt: 'unlock-protocol',
      },
    ],
  },
  twitter: {
    handle: 'UnlockProtocol',
    site: 'UnlockProtocol',
    cardType: 'summary_large_image',
  },
}

export const SOCIAL_URL = {
  twitter: 'https://twitter.com/UnlockProtocol',
  github: 'https://github.com/unlock-protocol',
}

interface SEOProps {
  title?: string
  description?: string
  image?: string
  url?: string
}

export function customizeSEO(options: SEOProps): NextSeoProps {
  const images = options.image
    ? [{ url: `${baseUrl}/images/${options.image}` }]
    : DEFAULT_SEO.openGraph?.images
  const url = options.url
  return {
    ...DEFAULT_SEO,
    ...options,
    openGraph: {
      ...DEFAULT_SEO.openGraph,
      images,
      url,
    },
  }
}
