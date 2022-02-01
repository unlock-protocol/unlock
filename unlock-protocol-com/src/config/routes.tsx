import { customizeSEO, DEFAULT_SEO } from './seo'
import type { DefaultSeoProps } from 'next-seo'

export interface Route {
  label: string
  path: string
  seo: DefaultSeoProps
}

export interface Routes {
  [key: string]: Route
}

export const routes: Routes = {
  home: {
    label: 'Home',
    path: '/',
    seo: DEFAULT_SEO,
  },
  privacy: {
    label: 'Privacy',
    path: '/privacy',
    seo: customizeSEO({
      title: 'Privacy Policy',
      description: 'Privacy policy of our site.',
    }),
  },
  terms: {
    label: 'Terms',
    path: '/terms',
    seo: customizeSEO({
      title: 'Terms of Service',
      description: 'Terms and conditions of our site.',
    }),
  },
  blog: {
    label: 'Blog',
    path: '/blog',
    seo: customizeSEO({
      title: 'Unlock Blog',
      description: 'News and updates from the Unlock team.',
    }),
  },
  about: {
    label: 'About',
    path: '/about',
    seo: customizeSEO({
      title: 'Unlock Team',
      description:
        "We're a small, smart and nimble team of coders and designers with a vision for a better and fairer way to monetize content.",
    }),
  },
  developers: {
    label: 'Developers',
    path: '/developers',
    seo: customizeSEO({
      title: 'Developers',
      description:
        'Learn about unlock protocol, integrations, and membership nfts.',
    }),
  },
  jobs: {
    label: 'Jobs',
    path: '/jobs',
    seo: customizeSEO({
      title: 'Work At Unlock',
      description:
        "We're looking for world-class engineers who want to fix the web forever.",
    }),
  },
  membership: {
    label: 'Membership',
    path: '/membership',
    seo: customizeSEO({
      title: 'Membership',
    }),
  },
}
