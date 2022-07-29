import { customizeSEO, DEFAULT_SEO } from './seo'
import type { DefaultSeoProps } from 'next-seo'

export interface Route {
  label: string
  seo: DefaultSeoProps
}

export interface Routes {
  [key: string]: Route
}

export const routes: Routes = {
  home: {
    label: 'Home',
    seo: DEFAULT_SEO,
  },
  privacy: {
    label: 'Privacy',
    seo: customizeSEO({
      path: '/privacy',
      title: 'Privacy Policy',
      description: 'Privacy policy of our site.',
    }),
  },
  terms: {
    label: 'Terms',
    seo: customizeSEO({
      path: '/terms',
      title: 'Terms of Service',
      description: 'Terms and conditions of our site.',
    }),
  },
  blog: {
    label: 'Blog',
    seo: customizeSEO({
      path: '/blog',
      title: 'Unlock Blog',
      description: 'News and updates from the Unlock team.',
    }),
  },
  about: {
    label: 'About Unlock Protocol',
    seo: customizeSEO({
      path: '/about',
      title: 'Unlock Team',
      description:
        "We're a small, smart and nimble team of coders and designers with a vision for a better and fairer way to monetize content.",
    }),
  },
  developers: {
    label: 'Developers',
    seo: customizeSEO({
      path: '/developers',
      title: 'Developers',
      description:
        'Learn about unlock protocol, integrations, and membership nfts.',
    }),
  },
  jobs: {
    label: 'Jobs',
    seo: customizeSEO({
      title: 'Work At Unlock',
      path: '/jobs',
      description:
        "We're looking for world-class engineers who want to fix the web forever.",
    }),
  },
  membership: {
    label: 'Membership',
    seo: customizeSEO({
      path: '/membership',
      title: 'Membership',
      description: 'Get your unlock protocol membership today!',
    }),
  },
  grants: {
    label: 'grants',
    seo: customizeSEO({
      path: '/grants',
      title: 'Unlock Grant Program',
      description:
        'Apply for Unlock Grant Program to receive UDT tokens, technical and promotional support.',
    }),
  },
  upcomingEvents: {
    label: 'Upcoming Events',
    seo: customizeSEO({
      path: '/upcoming-events',
      title: 'Upcoming Events',
      description: 'Join the Unlock Protocol community and core teams for conferences, workshops, AMA, Governance and, other activities',
    }),
  },
}
