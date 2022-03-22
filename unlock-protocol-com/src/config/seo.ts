import type { DefaultSeoProps, NextSeoProps } from 'next-seo'
import { unlockConfig } from './unlock'

export const { baseURL } = unlockConfig

export const DEFAULT_SEO: DefaultSeoProps = {
  title: 'Unlock',
  description:
    'Unlock is a protocol which enables creators to monetize their content with a few lines of code in a fully decentralized way.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: baseURL,
    site_name: 'unlock-protocol',
    images: [
      {
        url: `${baseURL}/images/unlock.png`,
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
  discourse: 'https://unlock.community/',
  discord: 'https://discord.com/invite/Ah6ZEJyTDp',
  snapshot: 'https://snapshot.org/#/unlock-protocol.eth',
}

interface SEOProps {
  title: string
  description?: string
  imagePath?: string
  path?: string
}

export function customizeSEO(options: SEOProps): NextSeoProps {
  const images = options.imagePath
    ? [
        // Twitter only fetch og:image if it is an absolute path with domain.
        {
          url: new URL(options.imagePath, baseURL).toString(),
          alt: options.title,
        },
      ]
    : DEFAULT_SEO.openGraph?.images
  const path = options.path ?? '/'
  const url = new URL(path, baseURL).toString()
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
